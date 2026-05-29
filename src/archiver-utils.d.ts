declare module 'archiver-utils' {
  const archiverUtils: {
    sanitizePath(filepath: string): string;
    unixifyPath(filepath: string): string;
  };

  export default archiverUtils;
}
