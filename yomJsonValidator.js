/**
 * Minified by jsDelivr using Terser v5.15.1.
 * Original file: /npm/yom-json-validator@1.2.0/dist/yom-json-validator.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
!(function (e, r) {
    "object" == typeof exports && "object" == typeof module
      ? (module.exports = r())
      : "function" == typeof define && define.amd
      ? define([], r)
      : "object" == typeof exports
      ? (exports.YomJsonValidator = r())
      : (e.YomJsonValidator = r());
  })(this, function () {
    return (function (e) {
      var r = {};
      function t(n) {
        if (r[n]) return r[n].exports;
        var a = (r[n] = { i: n, l: !1, exports: {} });
        return e[n].call(a.exports, a, a.exports, t), (a.l = !0), a.exports;
      }
      return (
        (t.m = e),
        (t.c = r),
        (t.i = function (e) {
          return e;
        }),
        (t.d = function (e, r, n) {
          t.o(e, r) ||
            Object.defineProperty(e, r, {
              configurable: !1,
              enumerable: !0,
              get: n,
            });
        }),
        (t.n = function (e) {
          var r =
            e && e.__esModule
              ? function () {
                  return e.default;
                }
              : function () {
                  return e;
                };
          return t.d(r, "a", r), r;
        }),
        (t.o = function (e, r) {
          return Object.prototype.hasOwnProperty.call(e, r);
        }),
        (t.p = ""),
        t((t.s = 0))
      );
    })([
      function (e, r) {
        var t = "yom-json-validator: ",
          n = [
            "type",
            "nullable",
            "default",
            "set",
            "max",
            "min",
            "maxLength",
            "minLength",
            "item",
            "value",
            "validator",
          ],
          a = ["dynamic", "array", "object", "string", "number", "boolean"],
          o = {};
        function i(e) {
          return e.replace(/\/+/g, "/").replace(/\/+$/g, "");
        }
        function u(e, r, n, a) {
          var i,
            u = e;
          if (
            (Array.isArray(e)
              ? ((i = e[0]), ((e = {})[o.nullable] = null === u[1]))
              : (i = e[o.item]),
            null == i)
          )
            throw new Error(
              t + "schema of array item must not be undefined. path: " + n
            );
          if (null == r) {
            if (e[o.nullable]) return null;
            throw new Error(t + "array can not be null. path: " + n);
          }
          if (!Array.isArray(r))
            throw new Error(t + "require an array. path: " + n);
          if (e[o.minLength] > 0 && r.length < e[o.minLength])
            throw new Error(
              t +
                "require an array of min length " +
                e[o.minLength] +
                ", actual length is " +
                r.length +
                ". path: " +
                n
            );
          if (e[o.maxLength] > 0 && r.length > e[o.maxLength])
            throw new Error(
              t +
                "require an array of max length " +
                e[o.maxLength] +
                ", actual length is " +
                r.length +
                ". path: " +
                n
            );
          return r.map(function (e, r) {
            return c(i, e, n + "/" + r, a);
          });
        }
        function l(e, r, n, a) {
          var i,
            u = {};
          if ((e[o.type] ? (i = e[o.value]) : ((i = e), (e = {})), null == r)) {
            if (e[o.nullable]) return null;
            throw new Error(t + "object can not be null. path: " + n);
          }
          if ("object" != typeof r)
            throw new Error(t + "require an object. path: " + n);
          return (
            Object.keys(i).forEach(function (e) {
              u[e] = c(i[e], r[e], n + "/" + e, a);
            }),
            u
          );
        }
        function f(e, r, n, a) {
          var i = e;
          if (
            ("string" == typeof e && ((e = {})[o.nullable] = "" === i), null == r)
          ) {
            if (e[o.default]) {
              if ("string" == typeof e[o.default]) return e[o.default];
              throw new Error(
                t +
                  "schema default value type not match schema type string. path: " +
                  n
              );
            }
            if (e[o.nullable]) return null;
            throw new Error(t + "string can not be undefined. path: " + n);
          }
          if ("string" != typeof r)
            throw new Error(t + "require a string. path: " + n);
          var u = e[o.set];
          if (Array.isArray(u) && u.length) {
            if (-1 === u.indexOf(r))
              throw new Error(
                t + "string must be in value set " + u.join(", ") + ". path: " + n
              );
          } else {
            if (e[o.minLength] > 0 && r.length < e[o.minLength])
              throw new Error(
                t +
                  "require a string of min length " +
                  e[o.minLength] +
                  ", actual length is " +
                  r.length +
                  ". path: " +
                  n
              );
            if (e[o.maxLength] > 0 && r.length > e[o.maxLength])
              throw new Error(
                t +
                  "require a string of max length " +
                  e[o.maxLength] +
                  ", actual length is " +
                  r.length +
                  ". path: " +
                  n
              );
          }
          return r;
        }
        function h(e, r, n, a) {
          var i = e;
          if (
            ("number" == typeof e && ((e = {})[o.nullable] = 0 === i), null == r)
          ) {
            if (e[o.default]) {
              if ("number" == typeof e[o.default]) return e[o.default];
              throw new Error(
                t +
                  "schema default value type not match schema type number. path: " +
                  n
              );
            }
            if (e[o.nullable]) return null;
            throw new Error(t + "number can not be undefined. path: " + n);
          }
          if ("number" != typeof r)
            throw new Error(t + "require a number. path: " + n);
          var u = e[o.set];
          if (Array.isArray(u) && u.length) {
            if (-1 === u.indexOf(r))
              throw new Error(
                t + "number must be in value set " + u.join(", ") + ". path: " + n
              );
          } else {
            if ("number" == typeof e[o.min] && r < e[o.min])
              throw new Error(
                t +
                  "require a number of min value " +
                  e[o.minLength] +
                  ", actual value is " +
                  r +
                  ". path: " +
                  n
              );
            if ("number" == typeof e[o.max] && r > e[o.max])
              throw new Error(
                t +
                  "require a number of max value " +
                  e[o.minLength] +
                  ", actual value is " +
                  r +
                  ". path: " +
                  n
              );
          }
          return r;
        }
        function p(e, r, n, a) {
          var i = e;
          if (
            ("boolean" == typeof e && ((e = {})[o.nullable] = !1 === i),
            null == r)
          ) {
            if (e[o.default]) {
              if ("boolean" == typeof e[o.default]) return e[o.default];
              throw new Error(
                t +
                  "schema default value type not match schema type boolean. path: " +
                  n
              );
            }
            if (e[o.nullable]) return null;
            throw new Error(t + "boolean can not be undefined. path: " + n);
          }
          if ("boolean" != typeof r)
            throw new Error(t + "require a boolean. path: " + n);
          return r;
        }
        function c(e, r, n, c) {
          n || ((n = ""), (c = r));
          var m,
            s = typeof e;
          if ("undefined" == s)
            throw new Error(t + "schema must not be undefined. path: " + n);
          if ("object" == s) {
            if (null === e) return null;
            if (Array.isArray(e)) return u(e, r, n, c);
            if (e[o.type]) {
              if ("dynamic" == (s = e[o.type])) {
                if ("function" != typeof (m = e[o.validator]))
                  throw new Error(
                    t +
                      o.validator +
                      " function not defined in validator type. path: " +
                      n
                  );
                return m({
                  value: r,
                  path: n,
                  rootValue: c,
                  getValueByPath: function (e) {
                    return (function (e, r, t) {
                      var n, a, o;
                      if ("object" == typeof e && e) {
                        if (0 === r.indexOf("/")) {
                          if (!(n = i(r))) return e;
                          a = n.split("/");
                        } else
                          for (
                            a = (n = i(t)).split("/").slice(0, -1),
                              o = (n = i(r)).split("/");
                            o.length;
  
                          )
                            (n = o.shift()) &&
                              "." != n &&
                              (".." == n ? a.pop() : a.push(n));
                        for (; a.length && "object" == typeof e && e; )
                          (n = a.shift()) && (e = e[n]);
                        return a.length ? void 0 : e;
                      }
                    })(c, e, n);
                  },
                });
              }
              if ("array" == s) return u(e, r, n, c);
              if ("object" == s) return l(e, r, n, c);
              if ("string" == s) return f(e, r, n);
              if ("number" == s) return h(e, r, n);
              if ("boolean" == s) return p(e, r, n);
              throw new Error(
                t +
                  "invalid schema " +
                  o.type +
                  " " +
                  s +
                  ", must be one of " +
                  a.join(", ") +
                  ". path: " +
                  n
              );
            }
            return l(e, r, n, c);
          }
          if ("string" == s) return f(e, r, n);
          if ("number" == s) return h(e, r, n);
          if ("boolean" == s) return p(e, r, n);
          throw new Error(
            t +
              "invalid schema type " +
              s +
              ", must be one of " +
              a.join(", ") +
              ". path: " +
              n
          );
        }
        function m(e) {
          n.forEach(function (r) {
            o[r] = e + r;
          });
        }
        m("$"), (e.exports = { validate: c, setKeyWordsPrefix: m });
      },
    ]);
  });
  //# sourceMappingURL=/sm/50a7a33754901d1f3fdce6e5dfe3fe661d92ae5bc983e10a98490808c8e98e57.map
  