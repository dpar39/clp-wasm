#pragma once
#pragma warning(disable : 4477)

//#include <boost/multiprecision/cpp_bin_float.hpp>
#include <boost/multiprecision/cpp_dec_float.hpp>
namespace mp = boost::multiprecision;

// using FloatT = mp::number<mp::cpp_bin_float<64>>;
// using FloatT = mp::number<mp::cpp_bin_float<128>>;
using FloatT = mp::number<mp::cpp_dec_float<100>, mp::et_off>;

#define TOO_SMALL_FLOAT (FloatT("-1.0E100"))
#define TOO_BIG_FLOAT (FloatT("+1.0E100"))

#define OneE27 (FloatT("1E90"))
// #define OneE10 (FloatT("1E10"))
// #define OneE11 (FloatT("1E11"))
// #define OneE12 (FloatT("1E12"))
// #define OneE13 (FloatT("1E13"))
// #define OneE15 (FloatT("1E15"))

// #define OneE25 (FloatT("1E25"))
// #define OneE27 (FloatT("1E90"))
// #define OneE30 (FloatT("1E30"))
// #define OneE31 (FloatT("1E31"))
// #define OneE40 (FloatT("1E40"))
// #define OneE50 (FloatT("1E50"))
// #define OneE100 (FloatT("1E100"))

#define OneE10 1.0e10
#define OneE11 1.0e11
#define OneE12 1.0e12
#define OneE13 1.0e13
#define OneE15 1.0e15
#define OneE25 1.0e25
#define OneE30 1.0e30
#define OneE31 1.0e31
#define OneE40 1.0e40
#define OneE50 1.0e50
#define OneE100 (1.0e100)

namespace std
{
template <typename T>
struct common_type<T, double>
{
    using type = T;
};
template <typename T>
struct common_type<double, T>
{
    using type = T;
};
template <typename T>
struct common_type<T, int>
{
    using type = T;
};
} // namespace std

inline int floor(const FloatT & x)
{
    return static_cast<int>(x);
}

template <typename T>
FloatT fd(const T x)
{
    return static_cast<FloatT>(x);
}

