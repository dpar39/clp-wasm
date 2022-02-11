
#[link(name = "libclp", kind = "static")]

extern "C" {
    fn solve(problem: *const c_char) -> *const c_char;
}




fn main() {

    println!("Hello, world!");

    let problem = "Maximize
    obj: + 0.6 x1 + 0.5 x2
  Subject To
    cons1: + x1 + 2 x2 <= 1
    cons2: + 3 x1 + x2 <= 2
  End";

    let c_buf: *const c_char = unsafe { solve() };
    
    
    let c_str: &CStr = unsafe { CStr::from_ptr(c_buf) };
    let str_slice: &str = c_str.to_str().unwrap();
    let str_buf: String = str_slice.to_owned(); 

}