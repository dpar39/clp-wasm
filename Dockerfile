FROM emscripten/emsdk:2.0.34

RUN apt update && apt install -y ninja-build ccache
RUN wget -qO- "https://cmake.org/files/v3.19/cmake-3.19.0-Linux-x86_64.tar.gz" | tar --strip-components=1 -xz -C /usr/local

# ADD https://dl.bintray.com/boostorg/release/1.75.0/source/boost_1_75_0.tar.gz .
# RUN tar -zxf boost_1_75_0.tar.gz -C /opt && rm boost_1_75_0.tar.gz
# ENV BOOST_ROOT /opt/boost_1_75_0

RUN git clone --recursive --depth=1 -b boost-1.75.0 https://github.com/boostorg/boost.git \
    && cd boost \
    && ./bootstrap.sh \
    && ./b2 toolset=emscripten headers

ENV BOOST_ROOT /src/boost

ENV CCACHE_DIR /app/.ccache
WORKDIR /app