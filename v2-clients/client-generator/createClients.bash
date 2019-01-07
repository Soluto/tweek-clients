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
thisPath=$(realpath ./)


# generate clients

createClient typescript-axios
createClient java
createClient go

# csharp
docker run --rm -v ${swaggerDirectory}:/swaggerDirectory -v ${outputPath}:/outputPath -v ${thisPath}:/configPath openapitools/openapi-generator-cli:v4.0.0-beta generate -i /swaggerDirectory/$swaggerFilename -g csharp -o outputPath/clients/csharp -c /configPath/csharp-configuration.yaml	

createClient swift