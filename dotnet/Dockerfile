FROM microsoft/dotnet:1-sdk

COPY . /test-environment

WORKDIR /test-environment

RUN dotnet restore

CMD tail -f /dev/null



