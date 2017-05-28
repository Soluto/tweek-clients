FROM microsoft/dotnet:1-sdk

COPY . /test-environment

WORKDIR /test-environment

RUN dotnet restore && dotnet build

CMD tail -f /dev/null



