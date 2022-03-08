extern crate libc;
extern crate c_string;

use c_string::CStrBuf;
use std::ffi::CStr;
use libc::c_char;
use std::str;

#[link(name = "libclp", kind = "static")]
extern "C" {
  fn clp_version() -> *const c_char;
  fn clp_solve(problem: *const c_char, precision: i32) -> *const c_char;
  fn bn_round(x: *const c_char) -> *const c_char;
  fn bn_ceil(x: *const c_char) -> *const c_char;
  fn bn_floor(x: *const c_char) -> *const c_char;
}

fn main() {
    println!("CLP called from Rust POC");

    let problem = "Maximize
      obj: + 0.6 x1 + 0.5 x2
    Subject To
      cons1: + x1 + 2 x2 <= 1
      cons2: + 3 x1 + x2 <= 2
    End";

    let problem_cstr = match CStrBuf::from_str(problem) {
        Ok(s) => s,
        Err(e) => panic!("{}", e)
    };
    let c_buf: *const c_char = unsafe { clp_solve(problem_cstr.as_ptr(), 1) };

    let c_str: &CStr = unsafe { CStr::from_ptr(c_buf) };
    let str_slice: &str = c_str.to_str().unwrap();
    let str_buf: String = str_slice.to_owned();
    println!("{}", str_buf);
}