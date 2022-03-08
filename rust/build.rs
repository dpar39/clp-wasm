
fn main() {
    println!("cargo:rustc-link-search=native=../build_x64_release");
    println!("cargo:rustc-link-lib=static=libclp");
    println!("cargo:rustc-link-lib=static=stdc++");
}