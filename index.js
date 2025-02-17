const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const mount = require('koa-mount');
const initConfig = require('./config/config.default');
const { bodyParser } = require('@koa/bodyparser');
// const { isApp, spaSupport } = require('./app/middleware/static.middleware');
const initApiRouter = require('./app/router/index');
const Logger = require('./app/utils/Logger');
const BaseController = require('./app/controller/base.controller');

const koaStatic = require('koa-static');
const path = require('path');
const fs = require('fs');

// 初始化
const app = new Koa();
const defaultConfig = initConfig(app);
// const { staticContext } = defaultConfig.static;
const staticRouter = new Router();
app.use(cors());

// // 静态文件挂载
// app.use(mount(staticContext, isApp));
// // spa 文件支持
// staticRouter.get(`${staticContext}/(.*)`, spaSupport);
// app.use(staticRouter.routes()).use(staticRouter.allowedMethods());


// 静态文件挂载
app.use(
	mount('/yyh-app/index', koaStatic(path.join(__dirname, 'static/admin'))),
);

// SPA 支持
staticRouter.get('/yyh-app/index/(.*)', async (ctx, next) => {
	const indexPath = path.join(__dirname, '/static/admin/index.html');
	try {
		const content = fs.readFileSync(indexPath, 'utf-8');
		ctx.type = 'text/html'; // 设置返回类型为 HTML
		ctx.body = content; // 返回 index.html 内容
	} catch (err) {
		console.error(err, ' static file error');
		ctx.status = 500;
		ctx.body = 'Index file not found!';
	}
});
app.use(staticRouter.routes()).use(staticRouter.allowedMethods());

// 动态接口 api支持
app.use(bodyParser());
initApiRouter(app);

// 统一的错误拦截器 如果业务当中没有及时抛出异常 在这里做兜底
app.on('error', (err, ctx) => {
	console.log('统一的错误处理');
	// 绑定上下文
	const errorController = new BaseController(ctx);
	errorController.errorHandle(err);
});
app.listen(defaultConfig.app.port, () => {
	Logger.info(
		`Server is running at Server is running at URL_ADDRESS${defaultConfig.app.host}:${defaultConfig.app.port}`,
	);
});
