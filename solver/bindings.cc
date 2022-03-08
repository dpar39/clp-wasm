#include "ClpWrapper.h"
#include "floatdef.h"

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <sstream>

#ifdef __EMSCRIPTEN_PTHREADS__
#include <future>
void solveAsync(std::string problem, int precision, emscripten::val cb)
{
    std::async([&]() {
        const auto result = solve(problem, precision);
        cb(emscripten::val(result));
    });
}
#endif

EMSCRIPTEN_BINDINGS(solver)
{
    using namespace emscripten;
    // free functions for general use
    function("bnCeil", &bnCeil);
    function("bnRound", &bnRound);
    function("bnFloor", &bnFloor);
    function("solve", &solve);
    #ifdef __EMSCRIPTEN_PTHREADS__
    function("solveAsync", &solveAsync);
    #endif
    function("version", &version);

    class_<ClpWrapper>("ClpWrapper")
        .constructor<>()
        .function("solve", &ClpWrapper::solve)
        .function("readLp", &ClpWrapper::readLp)
        .function("readMps", &ClpWrapper::readMps)
        .function("primal", &ClpWrapper::primal)
        .function("dual", &ClpWrapper::dual)
        .function("getSolution", &ClpWrapper::getSolution)
        .function("loadProblem", &ClpWrapper::loadProblemJS)
        .function("getSolutionArray", &ClpWrapper::getSolutionArray)
        .function("getUnboundedRay", &ClpWrapper::getUnboundedRay)
        .function("getInfeasibilityRay", &ClpWrapper::getInfeasibilityRay);
}

#else
#include <iostream>
int main(int argc, char * argv[])
{
    const auto InfL = -10e27;
    const auto InfU = +10e27;

    ClpWrapper clp;
    const auto success = clp.loadProblem({-0.6, -0.5}, {InfL, InfL}, {InfU, InfU}, {InfL, InfL}, {1, 2}, { 1, 2, 3, 1 });
    clp.primal();
    std::cout << "Solution: " << clp.getSolution(9) << std::endl;

    for (int k = 1; k < argc; ++k)
    {
        const auto problemFile = std::string(argv[k]);
        auto solution = solve(problemFile, 0);
        std::cout << "Problem: " << problemFile << std::endl;
        std::cout << "Solution: " << solution << std::endl;
    }
    return 0;
}
#endif
