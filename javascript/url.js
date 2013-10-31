/*jslint indent: 2, maxlen: 80, nomen: true, sloppy: true */
/*global */

// keywords: js, javascript, url manipulator

/**
 * Inspired by nodejs url module
 * http://nodejs.org/api/url.html
 */

function Url() {
  this.href = null;
  this.protocol = null;
  this.host = null;
  this.auth = null;
  this.hostname = null;
  this.port = null;
  this.pathname = null;
  this.search = null;
  this.path = null;
  this.query = null;
  this.hash = null;
}
// {
//   href: http://user:pass@host.com:8080/p/a/t/h?query=string#hash
//   protocol: http:
//   host: host.com:8080
//   auth: user:pass
//   hostname: host.com
//   port: 8080
//   pathname: /p/a/t/h
//   search: ?query=string
//   path: /p/a/t/h?query=string
//   query: {"query": "string"} or 'query=string'
//   hash: #hash
// }

var ipv6_re_str =
  "(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{" +
  "1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)" +
  "(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]" +
  "{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\" +
  "d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?" +
  ":(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-" +
  "Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|" +
  "2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:" +
  "(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|" +
  "2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d" +
  ")){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})" +
  "|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d" +
  ")(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-" +
  "f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0" +
  ",4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d" +
  "|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(" +
  "?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:" +
  "\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?",
  double_slash_protocol_re_str = "([a-zA-Z]+://)",
  no_slash_protocol_re_str = "([a-zA-Z]+:)",
  protocol_re_str = "([a-zA-Z]+:(?://)?)",
  user_password_re_str =
  "(?:(" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|[\\-a-zA-Z0-9\\._~!\\$&'\\(\\)\\*\\+,;=@])+" +
  "(?::" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|[\\-a-zA-Z0-9\\._~!\\$&'\\(\\)\\*\\+,;=:@])+" +
  ")?" +
  ")@)?",
  host_name_re_str =
  "(" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|[\\-a-zA-Z0-9\\._~!\\$&'\\(\\)\\*\\+,;=@])+" +
  "|\\[" + ipv6_re_str + "\\]" +
  ")",
  port_re_str =
  "(?::([0-9]+))?",
  path_name_re_str =
  "(" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|[/\\-a-zA-Z0-9\\._~!\\$&'\\(\\)\\*\\+,;=:@])+" +
  ")?",
  search_re_str =
  "(\\?" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|" +
  "[/\\-a-zA-Z0-9\\._~!\\$'\\(\\)\\*\\+\\?,;=:@])+" +
  "(?:&" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|" +
  "[/\\-a-zA-Z0-9\\._~!\\$'\\(\\)\\*\\+\\?,;=:@])+" +
  ")*" +
  ")?",
  hash_re_str =
  "(#" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|" +
  "[/\\-a-zA-Z0-9\\._~!\\$&'\\(\\)\\*\\+\\?,;=:@])+" +
  ")?",
  url_re = new RegExp(
    "^(?:" + protocol_re_str + user_password_re_str + host_name_re_str +
      port_re_str + ")?" + path_name_re_str + search_re_str + hash_re_str + "$"
  ),

  query_re_str =
  "(" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|" +
  "[/\\-a-zA-Z0-9\\._~!\\$'\\(\\)\\*\\+\\?,;:@])+" +
  ")(?:=(" +
  "(?:%[0-9a-fA-F][0-9a-fA-F]|" +
  "[/\\-a-zA-Z0-9\\._~!\\$'\\(\\)\\*\\+\\?,;=:@])+" +
  "))?",
  query_re = new RegExp(query_re_str);

/**
 * Take a URL string, and return an object
 *
 * @param  {String} url_str The url to parse
 * @param  {Boolean} [parse_query_string=false] If true, parse the url search
 *                   part
 * @return {Object} The Url object
 */
function parse(url_str, parse_query_string) {
  // TODO
  // * @param  {Boolean} [slashes_denote_host=false] If true, consider that the
  // *                   ressource name following double slash is the host
  var result, query, search, url_obj;
  url_str = url_str.replace(/ /g, '%20');
  result = url_re.exec(url_str);
  if (result === null) {
    return null;
  }
  url_obj = new Url();
  url_obj.href = result[0] || "";
  url_obj.protocol = result[1] || "";
  url_obj.auth = result[2] || "";
  url_obj.hostname = result[3] || "";
  url_obj.port = result[4] || "";
  url_obj.pathname = result[5] || "";
  url_obj.search = result[6] || "";
  url_obj.hash = result[7] || "";
  url_obj.host = url_obj.hostname + (url_obj.port ? ":" + url_obj.port : "");
  url_obj.path = url_obj.pathname + url_obj.search;

  if (parse_query_string) {
    url_obj.query = {};
    search = url_obj.search;
    /*jslint ass: true */
    while ((query = query_re.exec(search)) !== null) {
      url_obj.query[decodeURI(query[1]).replace(/%26/g, '&')] =
        decodeURI(query[2] || "").replace(/%26/g, '&');
      search = search.replace(query_re, "");
    }
  } else {
    url_obj.query = url_obj.search.slice(1);
  }
  return url_obj;
}

/**
 * Take a parsed URL object, and return a formatted URL string.
 *
 * @param  {Object} url_obj The url object to format
 * @return {String} The url string
 */
function format(url_obj) {
  var result = "", key;
  result += url_obj.protocol || "";
  result += (url_obj.auth && url_obj.auth + "@") || "";
  result += url_obj.host || (url_obj.hostname || "") + (url_obj.port || "");
  if (url_obj.pathname === 'string' && url_obj.pathname[0] !== "/" &&
      result !== url_obj.protocol && result.slice(-1) !== "/") {
    result += "/";
  }
  result += url_obj.pathname || '';

  if (url_obj.search) {
    if (url_obj.search[0] !== "?") {
      result += "?";
    }
    result += url_obj.search;
  } else if (url_obj.query) {
    result += "?";
    if (typeof url_obj.query === "string") {
      result += url_obj.query;
    } else if (typeof url_obj.query === "object" &&
               !Array.isArray(url_obj.query)) {
      for (key in url_obj.query) {
        if (url_obj.query.hasOwnProperty(key)) {
          result += key + "=" + url_obj.query[key] + "&";
        }
      }
      result = result.slice(0, -1);
    }
  }
  if (url_obj.hash && url_obj.hash[0] !== "#") {
    result += "#";
  }
  result += url_obj.hash || '';
  return result;
}

/**
 * Take a base URL, and a href URL, and resolve them as a browser would for an
 * anchor tag.
 *
 * @param  {String} from The base URL
 * @param  {String} to The href URL
 * @return {String} The solved URL
 */
function resolve(from, to) {
  var parsed_to = parse(to), parsed_from;
  if (parsed_to.protocol || parsed_to.host) {
    return to;
  }
  parsed_from = parse(from);
  parsed_from.search = parsed_to.search;
  parsed_from.hash = parsed_to.hash;
  if (parsed_to.path[0] === "/") {
    // absolute path
    parsed_from.pathname = parsed_to.pathname;
  } else {
    parsed_from.pathname =
      parsed_from.pathname.slice(0, parsed_from.pathname.lastIndexOf("/") + 1) +
      parsed_to.pathname;
  }
  return format(parsed_from);
}
