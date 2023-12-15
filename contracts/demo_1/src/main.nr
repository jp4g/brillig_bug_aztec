contract BrilligBugDemo1 {
    use dep::aztec::{
        context::{PrivateContext, Context},
        selector::compute_selector,
    };

    #[aztec(private)]
    fn constructor() { }

    #[aztec(private)]
    fn function_one() {
        context.call_private_function_no_args(
            context.this_address(),
            compute_selector("function_two()")
        );
    }

    #[aztec(private)]
    fn function_two() { }
}