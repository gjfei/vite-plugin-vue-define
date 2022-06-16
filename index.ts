import type { Plugin } from 'vite';

export interface Options {
  include?: String | RegExp | string[];
}

const isRegExp = (val: any): val is RegExp => val instanceof RegExp;

const isString = (val: any): val is string => typeof val === 'string';


const isArray = (val: any): val is string[] => Array.isArray(val);

function viteDefinePlugin(options:Options = {}): Plugin {
  const { include = /^__/ } = options;

  const isVue = (id:string) => /\.vue$/.test(id);
  const templateReg = /<template>(.+)<\/template>/gs;

  let define: Record<string, any>;
  let defineReg: RegExp;

  const replaceDefine = (match:string, ...args:any[]) => {
    const val = define[match];
    if (isString(val)) {
      let start = args.slice(-2, -1)[0];
      let end = 0;
      const template = args.splice(-1)[0];
      const len = template.length;

      const temMap: {
        [key:string]: number;
      } = {
        "'": 0,
        '"': 0,
      };

      let nextQuote = '';

      if(len / 2 < start) {
        start = len;
        end = start + match.length
      }
      
      while (start > end) {
        const current = template[start] as string;
        if (current in temMap) {
          if (!nextQuote) {
            nextQuote = current;
          }
          temMap[current]++;
        }
        start--;
      }

      const quoteList = Object.entries(temMap).filter(
        ([_, count]) => count % 2 !== 0
      );

      let quote = quoteList.length && quoteList[0][0];

      if (!quoteList.length || quoteList.length === 2) {
        quote = nextQuote;
      }

      quote = quote === '"' ? "'" : '"';

      return `${quote}${val.slice(1, -1)}${quote}`;
    }
    return define[match];
  };

  const filterDefine = (() => {
    let isIncludeReg:RegExp;

    if(isRegExp(include)){
      isIncludeReg = include;
    }else if(isString(include)){
      isIncludeReg = new RegExp(include);
    }else if(isArray(include)){
      isIncludeReg = new RegExp(include.join('|'));
    }

    return (key:string) => isIncludeReg.test(key);
  })(); 
  
  return {
    name: 'vite-define-plugin',
    configResolved(config) {
      define = Object.entries(config.define!).reduce((obj, [key, val])=> {
        if(filterDefine(key)){
          obj[key] = val;
        }
        return obj;
      }, {} as Record<string, any>);
      defineReg = new RegExp(
        Object.keys(define)
          .map((str) => `(${str})`)
          .join('|'),
        'g'
      );
    },
    transform(code, id) {
      if (isVue(id)) {
        return code.replace(templateReg, (template) =>
          template.replace(defineReg, replaceDefine)
        );
      }
      return undefined;
    },
  };
}

export default viteDefinePlugin;