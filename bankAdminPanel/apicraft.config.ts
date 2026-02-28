import { apicraft } from '@siberiacancode/apicraft'


export default apicraft([
   {
      input: 'http://localhost:4000/swagger.yml' ,
      output: 'generated/api/auth',
      instance: {name: 'axios', runtimeInstancePath: './src/api/instance.ts'},
      nameBy: 'path',
      groupBy: 'tag',
   },
   {
      input: 'http://localhost:4001/swagger.yml' ,
      output: 'generated/api/user',
      instance: {name: 'axios', runtimeInstancePath: './src/api/instance.ts'},
      nameBy: 'path',
      groupBy: 'tag',
   },
   {
      input: 'http://localhost:4002/swagger.yml' ,
      output: 'generated/api/credits',
      instance: {name: 'axios', runtimeInstancePath: './src/api/instance.ts'},
      nameBy: 'path',
      groupBy: 'tag',
   },
   {
      input: 'http://localhost:4003/swagger.yml' ,
      output: 'generated/api/core',
      instance: {name: 'axios', runtimeInstancePath: './src/api/instance.ts'},
      nameBy: 'path',
      groupBy: 'tag',
   },
])
