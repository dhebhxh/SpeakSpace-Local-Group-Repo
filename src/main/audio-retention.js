const path = require("path");

function isPathInside(filePath, rootDir) {
  if (!filePath || !rootDir) return false;
  const relative = path.relative(path.resolve(rootDir), path.resolve(filePath));
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function getManagedRecordingDisposition(audioPath, recordingsDir, referenceCount = 0) {
  const managed = isPathInside(audioPath, recordingsDir);
  const shared = managed && referenceCount > 1;
  return {
    managed,
    canDelete: managed && !shared,
    shared,
  };
}

module.exports = {
  getManagedRecordingDisposition,
};
