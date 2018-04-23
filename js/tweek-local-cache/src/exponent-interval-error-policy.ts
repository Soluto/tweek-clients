export default (maxExponent)=>
{
    return (resume: ()=>void, retryCount)=>
        setTimeout(resume, 2 ** (retryCount - 1))
}