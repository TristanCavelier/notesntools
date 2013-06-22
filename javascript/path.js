
/**
 * Inspired by nodejs path
 * http://www.chat.nodejs.org/api/path.html
 */

/**
 * Convert a windows path to an unix path. Ex: `C:\my\pa/th` -> `/C:/my/pa\th`.
 *
 * @method dos2unix
 * @param  {String} path The windows path
 * @return {String} The unix path
 */
function dos2unix(path) {
  var i, split = path.split("/");
  for (i = 0; i < split.length; i += 1) {
    split[i] = split[i].replace(/\\/g, "/");
  }
  if (/^[a-zA-Z]:(?:\\|$)/.test(path)) {
    return "/" + split.join("\\");
  }
  return split.join("\\");
}

/**
 * Convert an unix path to a windows path. Ex: `/C:/my/pa\th` -> `C:\my\pa/th`.
 *
 * @method dos2unix
 * @param  {String} path The unix path
 * @return {String} The windows path
 */
function unix2dos(path) {
  var i, split = path.split("/");
  for (i = 0; i < split.length; i += 1) {
    split[i] = split[i].replace(/\\/g, "/");
  }
  if (/^\/[a-zA-Z]:(?:\/|$)/.test(path)) {
    split.shift();
    return split.join("\\");
  }
  return split.join("\\");
}

/**
 * Normalize a string path, taking care of '..' and '.' parts.
 *
 * When multiple slashes are found, they're replaced by a single one;
 * when the path contains a trailing slash, it is preserved.
 *
 * @method normalize
 * @param  {String} path The path to normalize
 * @return {String} The normalized path
 */
function normalize(path) {
  var i = 1, split = path.split("/");
  if (path === "") {
    return ".";
  }
  while (i < split.length) {
    if (split[i] === "" || split[i] === ".") {
      split.splice(i, 1);
    } else if (split[i] === "..") {
       if (split[i - 1] === "") {
         split.splice(i, 1);
      } else if (split[i - 1] !== "..") {
        if (i >= 2) {
          i -= 1;
          split.splice(i, 2);
        } else {
          i += 1;
        }
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }
  if (path[path.length - 1] === "/") {
    split.push("");
  }
  return split.join("/");
}

/**
 * Join all arguments together and normalize the resulting path.
 *
 * @method join
 * @param  {String} [path]* The path to join
 * @return {String} The joined path
 */
function join() {
  var i, path = arguments[0];
  if (arguments.length === 0) {
    return ".";
  }
  for (i = 1; i < arguments.length; i += 1) {
    if (typeof arguments[i] !== "string") {
      throw new TypeError("Arguments to path.join must be strings");
    }
    path += "/" + arguments[i];
  }
  return normalize(path);
}

/**
 * Resolves `to` to an absolute path.
 *
 * If `to` ins't already absolute `from` arguments are prepended in right to
 * left order, until an absolute path is found. If after using all `from` paths
 * still no absolute path is found, the root directory is used as well.
 * The resulting path is normalized, and trailing slashes are removed
 * unless the path gets resolved to the root directory. Non-string arguments
 * are ignored.
 *
 * @method resolve
 * @param  {String} [path]* The path to resolve
 * @return {String} The resolved path
 */
function resolve() {
  var i, path = "", from = "/";
  for (i = arguments.length - 1; i >= 0; i -= 1) {
    if (typeof arguments[i] === "string") {
      path = arguments[i] + "/" + path;
      if (path[0] === "/") {
        break;
      }
    }
  }
  if (path[0] === "/") {
    return normalize(path.slice(0, -1));
  }
  return normalize(from + path.slice(0, -1));
}

/**
 * Solve the relative path from `from` to `to`.
 *
 * At times we have two absolute paths, and we need to derive the relative path
 * from one to the other. This is actually the reverse transform of
 * `path.resolve`, which means we see that:
 *
 *     path.resolve(from, path.relative(from, to)) === path.resolve(to)
 *
 * @method relative
 * @param  {String} from The path we start from
 * @param  {String} to The path we want to go
 * @return {String} The solved relative path
 */
function relative(from, to) {
  var split_from, split_to, path = [];
  if (to[0] !== "/") {
    return normalize(to);
  }
  if (from[0] !== "/") {
    return normalize(to.slice(1));
  }
  split_from = normalize(from).split("/");
  split_to = normalize(to).split("/");
  while (split_from[0] === split_to[0]) {
    split_from.shift();
    split_to.shift();
  }
  while (split_from.shift() !== undefined) {
    path.push("..");
  }
  while ((split_from = split_to.shift()) !== undefined) {
    path.push(split_from);
  }
  return path.join("/");
}

/**
 * Return the directory name of a path. Similar to the Unix `dirname` command.
 *
 * @method dirname
 * @param  {String} path The path
 * @return {String} The directory path
 */
function dirname(path) {
  var i;
  if (!path) {
    return ".";
  }
  if (path === "/") {
    return "/";
  }
  for (i = path.length - 2; i >= 0; i -= 1) {
    if (path[i] === "/") {
      break;
    }
  }
  if (i !== -1) {
    return path.slice(0, i);
  }
  return ".";
}

/**
 * Return the last portion of a path. Similar to the Unix `basename` command.
 *
 * @method basename
 * @param  {String} path The path
 * @param  {String} [ext] The file extension
 * @return {String} The basename of the file
 */
function basename(path, ext) {
  var i;
  if (path[path.length - 1] === "/") {
    path = path.slice(0, -1);
  }
  if (typeof ext === "string") {
    for (i = 0; i < ext.length; i += 1) {
      if (path[path.length - ext.length + i] !== ext[i]) {
        break;
      }
    }
    if (i === ext.length) {
      path = path.slice(0, -ext.length);
    }
  }
  for (i = path.length - 1; i >= 0; i -= 1) {
    if (path[i] === "/") {
      break;
    }
  }
  if (i !== undefined) {
    return path.slice(i);
  }
  return path;
}

/**
 * Return the extension of the path, from the last '.' to end of string in the
 * last portion of the path. If there is no '.' in the last portion of the path
 * or the first character of it is '.', then it returns an empty string.
 *
 * @method extname
 * @param  {String} path The path
 * @return {String} The file extension
 */
function extname(path) {
  var i;
  for (i = (path || "").length - 1; i >= 0; i -= 1) {
    if (path[i] === ".") {
      return path.slice(i);
    }
  }
  return "";
}

////////////////////////////////////////////////////////////////////////////////
// Tests
console.log('dos2unix():', dos2unix('C:') === '/C:');
console.log('dos2unix():', dos2unix('C:\\my\\path') === '/C:/my/path');
console.log('dos2unix():', dos2unix('\\my\\path') === '/my/path');
console.log('dos2unix():', dos2unix('my\\path') === 'my/path');

console.log('unix2dos():', unix2dos('/C:') === 'C:');
console.log('unix2dos():', unix2dos('/C:/my/path') === 'C:\\my\\path');
console.log('unix2dos():', unix2dos('/my/path') === '\\my\\path');
console.log('unix2dos():', unix2dos('my/path') === 'my\\path');

console.log('normalize():', normalize('/foo/bar//baz/asdf/quux/..') === '/foo/bar/baz/asdf');
console.log('normalize():', normalize('') === '.');

console.log('join():', join("/foo", "bar", "baz/asdf", "quux", "..") === '/foo/bar/baz/asdf');
console.log('join():', join() === '.');

console.log('resolve():', resolve('foo/bar', '/tmp/file/', '..', 'a/../subfile') === '/tmp/subfile');
console.log('resolve():', resolve() === '/');

console.log('relative():', relative('/a', 'b') === 'b');
console.log('relative():', relative('a', '/b') === 'b');
console.log('relative():', relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb') === '../../impl/bbb');

console.log('dirname():', dirname() === ".");
console.log('dirname():', dirname("") === ".");
console.log('dirname():', dirname(".") === ".");
console.log('dirname():', dirname("/") === "/");
console.log('dirname():', dirname("/a/b/") === "/a");

console.log('basename():', basename("") === "");
console.log('basename():', basename(".") === ".");
console.log('basename():', basename("/") === "");
console.log('basename():', basename("/abc.d/", '.d') === "/abc");

console.log('extname():', extname() === "");
console.log('extname():', extname("index.html") === ".html");
console.log('extname():', extname("index") === "");
