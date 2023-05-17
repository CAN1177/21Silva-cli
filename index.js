#!/usr/bin/env node

// 命令行解析
let program = require("commander");
// 下载项目
let download = require("download-git-repo");
// 加载loading
let ora = require("ora");
// 文本样式
let chalk = require("chalk");
// 获取命令行交互
let inquirer = require("inquirer");
// 编译文件包
let handleBars = require("handlebars");
// 操作文件包
let fs = require("fs");
let spinner = ora();

// 获取cli版本号
let { version } = require("./package.json");
program.version(version);

// 脚手架对应的模版
let templates = [
  {
    key: "React18+Vite4+Ts后台系统",
    value: "https://github.com:CAN1177/templateDemo",
  },
];

// 选择项目模板下载
let selectTemplate = async (templateName) => {
  let res = await inquirer.prompt([
    {
      type: "list",
      name: "choice",
      message: "请选择需要初始化的项目:",
      default: "https://github.com:CAN1177/templateDemo",
      choices: templates,
    },
  ]);
  // 获取用户选择的模板
  let { choice } = res;
  // loading状态
  spinner.start("正在拉取项目模板");
  downloadTemplate(choice, templateName);
};
// 下载模板
let downloadTemplate = (url, project) => {
  download(url, project, { clone: true }, async (err) => {
    if (err) {
      spinner.fail();
      return console.log(err);
    }
    spinner.succeed("模版下载成功，等待项目初始化！");
    // 初始化package.json命令行交互my
    let answers = await inquirer.prompt([
      {
        type: "input",
        message: "请设置项目名称:",
        name: "name",
        default: "demo", // 默认值
      },
      {
        type: "input",
        message: "请设置项目作者:",
        name: "author",
        default: "21Silva", // 默认值
      },
      {
        type: "input",
        message: "请设置项目描述:",
        name: "description",
        default: "暂无，自行补充", // 默认值
      },
      {
        type: "confirm",
        message: "请设置项目是否私有:",
        name: "private",
        default: true, // 默认值
      },
    ]);
    const path = `${project}/package.json`;
    // 读取package.json
    let packCont = fs.readFileSync(path, "utf8");
    let compileCont = handleBars.compile(packCont)(answers);
    // 重新写入
    fs.writeFileSync(path, compileCont);
    spinner.succeed(
      chalk.green("Initialization template completed, You are so great!")
    );
  });
};

// 初始化命令行
program
  .command("init <project>")
  .description("选择项目模版")
  .action((project) => {
    // 下载模版
    selectTemplate(project);
  });

// 查看所有的模版
program
  .command("list")
  .description("查看所有的可用模版")
  .action(() => {
    for (let key in templates) {
      console.log(templates[key]);
    }
  });

program
  .command("*")
  .description("找不到相应的命令")
  .action(() => {
    spinner.fail(chalk.red("找不到相应的命令！"));
  });
// 解析命令行
program.parse(process.argv);
