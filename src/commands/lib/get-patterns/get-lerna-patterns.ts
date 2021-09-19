import { isArrayOfStrings } from 'expect-more';
import { pipe } from 'fp-ts/lib/function';
import { filter, map as mapOption, Option } from 'fp-ts/lib/Option';
import { map as mapTaskEither, TaskEither } from 'fp-ts/TaskEither';
import { join } from 'path';
import { getIn } from './get-in';
import { readJsonSafe } from './read-json-safe';

/**
 * @param filePath Absolute file path to a lerna.json
 */
export function getLernaPatterns(filePath: string): TaskEither<Error, Option<string[]>> {
  return pipe(
    readJsonSafe(filePath),
    mapTaskEither((lerna) =>
      pipe(
        getIn<string[]>(['packages'], lerna),
        filter(isArrayOfStrings),
        mapOption(addRootDir),
        mapOption(limitToPackageJson),
      ),
    ),
  );
}

function addRootDir(patterns: string[]): string[] {
  return [process.cwd(), ...patterns];
}

function limitToPackageJson(patterns: string[]): string[] {
  return patterns.map((pattern) => join(pattern, 'package.json'));
}
