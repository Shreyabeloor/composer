/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const Admin = require('composer-admin');
const BusinessNetworkDefinition = Admin.BusinessNetworkDefinition;
const fs = require('fs');
const sanitize = require('sanitize-filename');
/**
 * Composer Create Archive command
 *
 * composer archive create --archiveFile digitialPropertyNetwork.zip --sourceType module --sourceName digitalproperty-network
 *
 * @private
 */
class Create {

  /**
    * Command process for deploy command
    * @param {string} argv argument list from composer command

    * @return {Promise} promise when command complete
    */
    static handler(argv) {

        let inputDir = '';

        console.log('Creating Business Network Archive\n');
        if (argv.sourceType === 'module'){
            // using a npm module name
            //
            let moduleName = argv.sourceName;
            const path = require('path');
            console.log('Node module search path : \n'+process.env.NODE_PATH+' \n');
            let moduleIndexjs;
            try {
                moduleIndexjs=require.resolve(moduleName);
            } catch (err){
                if (err.code==='MODULE_NOT_FOUND'){
                    let localName = process.cwd()+'/node_modules/'+moduleName;
                    console.log('Not found in main node_module search path, trying current directory :'+localName);
                    moduleIndexjs=require.resolve(localName);
                }else {
                    console.log('Unable to locate the npm module specified');
                    return Promise.reject(err);
                }

            }

            inputDir = path.dirname(moduleIndexjs);
            // console.log('Resolved module name '+argv.sourceName+ '  to '+inputDir);
        }else {
          // loading from a file directory given by user
            if (argv.sourceName==='.'){
                inputDir = process.cwd();
            } else {
                inputDir = argv.sourceName;
            }
        }
        console.log('Looking for package.json of Business Network Definition in '+inputDir);

        return BusinessNetworkDefinition.fromDirectory(inputDir).then( (result)=> {
            console.log('\nFound:\nDescription:'+result.getDescription());
            console.log('Name:'+result.getName());
            console.log('Identifier:'+result.getIdentifier());


            if (!argv.archiveFile){
                argv.archiveFile = sanitize(result.getIdentifier(),{replacement:'_'})+'.bna';
            }
          // need to write this out to the required file now.
            return result.toArchive().then (
              (result) => {
                //write the buffer to a file
                  fs.writeFileSync(argv.archiveFile,result);
                  console.log('\nWritten Business Network Definition Archive file to '+argv.archiveFile);
                  return;
              }

            );

        }).catch(function(e) {
            console.log(e.stack);
            console.log(e); // "oh, no!"
        });

    }
}

module.exports = Create;
