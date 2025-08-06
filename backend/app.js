var createError = require("http-errors");
var express = require("express");
var app = express();
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var authRouter = require("./routes/auth");
var ProductsRouter = require('./routes/qiao')
var captchaRouter = require("./routes/captcha");

// 导入数据库模型（确保数据库连接和模型初始化）
require("./moudle/index");

//导入中间件
var cors = require("cors");
app.use(cors());

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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`, req.body);
  next();
});
// 添加测试路由
app.get("/test", (req, res) => {
  res.json({
    code: 200,
    message: "后端服务正常运行",
    timestamp: new Date().toISOString()
  });
});

// 路由配置
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/qiao", ProductsRouter)
app.use("/captcha", captchaRouter);
// 需要认证的路由 - 使用express-jwt
app.use("/api/protected", jwtAuth, verifyTokenType); // 需要强制验证的路由


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
