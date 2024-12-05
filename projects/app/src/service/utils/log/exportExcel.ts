const XLSX = require('xlsx');

export async function exportExcel(datas: any[], fileName = 'xxx') {
  const headers = [
    {
      title: '应用ID',
      key: 'appId'
    },
    {
      title: '应用名称',
      key: 'appName'
    },
    {
      title: '所属项目ID',
      key: 'teamId'
    },
    {
      title: '所属项目名称',
      key: 'teamName'
    },
    {
      title: '聊天ID',
      key: 'chatId'
    },
    {
      title: '用户ID',
      key: 'userId'
    },
    {
      title: '用户名称',
      key: 'userName'
    },
    {
      title: '角色',
      key: 'role'
    },
    {
      title: '时间',
      key: 'time'
    },
    {
      title: '内容',
      key: 'content'
    },
    {
      title: '用户正面反馈',
      key: 'userGoodFeedback'
    },
    {
      title: '用户负面反馈',
      key: 'userBadFeedback'
    }
  ];

  const _headers = headers
    .map((item, i) =>
      Object.assign(
        {},
        { key: item.key, title: item.title, position: String.fromCharCode(65 + i) + 1 }
      )
    )
    .reduce(
      (prev: any, next: { position: any; key: any; title: any }) =>
        Object.assign({}, prev, { [next.position]: { key: next.key, v: next.title } }),
      {}
    );

  console.log(datas);

  const _data = datas
    .map((item, i) =>
      headers.map((key, j) =>
        Object.assign(
          {},
          { content: item[key.key], position: String.fromCharCode(65 + j) + (i + 2) }
        )
      )
    )
    // 对刚才的结果进行降维处理（二维数组变成一维数组）
    .reduce((prev, next) => prev.concat(next))
    // 转换成 worksheet 需要的结构
    .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.content } }), {});

  // 合并 headers 和 data
  const output = Object.assign({}, _headers, _data);
  // 获取所有单元格的位置
  const outputPos = Object.keys(output);
  // 计算出范围 ,["A1",..., "H2"]
  const ref = `${outputPos[0]}:${outputPos[outputPos.length - 1]}`;

  // 构建 workbook 对象
  const wb = {
    SheetNames: ['mySheet'],
    Sheets: {
      mySheet: Object.assign({}, output, {
        '!ref': ref,
        '!cols': [
          { wpx: 150 },
          { wpx: 50 },
          { wpx: 150 },
          { wpx: 80 },
          { wpx: 100 },
          { wpx: 150 },
          { wpx: 50 },
          { wpx: 50 },
          { wpx: 200 },
          { wpx: 300 },
          { wpx: 100 },
          { wpx: 200 }
        ]
      })
    }
  };

  // 导出 Excel
  XLSX.writeFile(wb, fileName + '_' + Date.now() + '.xlsx');
}
