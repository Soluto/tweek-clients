realpath () {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

createClient () {
	docker run --rm -v ${swaggerDirectory}:/swaggerDirectory -v ${outputPath}:/outputPath openapitools/openapi-generator-cli:v4.0.0-beta generate -i /swaggerDirectory/$swaggerFilename -g $1 -o outputPath/clients/$1	
}
swaggerFilePath=$(realpath $1)
swaggerDirectory=$(dirname $swaggerFilePath)
swaggerFilename=$(basename $swaggerFilePath)
outputPath=$(realpath $2)
docker pull openapitools/openapi-generator-cli:v4.0.0-beta
createClient typescript-node

# In typescript client: replace wrong type 'ClientResponse' with 'IncomingMessage' for http response
sed -i -e 's/ClientResponse/IncomingMessage/g' ${outputPath}/clients/typescript-node/api.ts

createClient java
createClient go
createClient csharp