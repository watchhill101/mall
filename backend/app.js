var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var merchantRouter = require("./routes/merchant");

//导入中间件
var cors = require("cors");
// app.use(cors());

//导入规则中间件
var joi = require("joi");
//导入主体解析
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//导入配置文件
var config = require("./config/index");
//导入JWT中间件
const {
  jwtAuth,
  optionalJwtAuth,
  verifyTokenType,
  jwtErrorHandler,
} = require("./utils/ejwt");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// 路由配置
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/merchant", merchantRouter);

// 需要认证的路由 - 使用express-jwt
app.use("/api/protected", jwtAuth, verifyTokenType); // 需要强制验证的路由
app.use("/api/optional", optionalJwtAuth); // 可选验证的路由

// JWT错误处理中间件
app.use(jwtErrorHandler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
