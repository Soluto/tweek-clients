realpath () {
    [[ $1 = /* ]] && echo "$1" || echo "$PWD/${1#./}"
}

createClient () {
	docker run --rm -v ${swaggerDirectory}:/swaggerDirectory -v ${outputPath}:/outputPath swaggerapi/swagger-codegen-cli:2.4.0 generate -i /swaggerDirectory/$swaggerFilename -l $1 -o outputPath/clients/$1	
}
swaggerFilePath=$(realpath $1)
swaggerDirectory=$(dirname $swaggerFilePath)
swaggerFilename=$(basename $swaggerFilePath)
outputPath=$(realpath $2)
echo $outputPath
docker pull swaggerapi/swagger-codegen-cli:2.4.0
createClient typescript-node
createClient java
createClient go
createClient csharp