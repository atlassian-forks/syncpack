import chalk from 'chalk';
import { DependencyType, SyncpackConfig } from '../constants';
import { getDependencyTypes } from './lib/get-dependency-types';
import { getMismatchedDependencies, InstalledPackage, sortByName } from './lib/get-installations';
import { getWrappers, SourceWrapper } from './lib/get-wrappers';
import { log } from './lib/log';

type Options = Pick<SyncpackConfig, 'dev' | 'filter' | 'peer' | 'prod' | 'source'>;

export const listMismatches = (
  dependencyTypes: DependencyType[],
  filter: RegExp,
  wrappers: SourceWrapper[],
): InstalledPackage[] => {
  const iterator = getMismatchedDependencies(dependencyTypes, wrappers);
  const mismatches = Array.from(iterator).filter(({ name }) => name.search(filter) !== -1);

  mismatches.sort(sortByName).forEach(({ name, installations }) => {
    log(chalk`{red ✕ ${name}}`);
    installations.forEach(({ source, type, version }) => {
      log(chalk`{dim -} ${version} {dim in ${type} of ${source.contents.name}}`);
    });
  });

  return mismatches;
};

export const listMismatchesFromDisk = ({ dev, filter, peer, prod, source: source }: Options): void | never => {
  const dependencyTypes = getDependencyTypes({ dev, peer, prod });
  const wrappers = getWrappers({ source });
  const mismatches = listMismatches(dependencyTypes, filter, wrappers);

  if (mismatches.length > 0) {
    process.exit(1);
  }
};
