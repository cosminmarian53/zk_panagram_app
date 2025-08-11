fn main(guess_hash: Field, answer_hash: pub Field) {
    assert(guess_hash == answer_hash, "Incorrect guess");
}

// #[test]
// fn test_main() {
//     main(1, 2);

//     // Uncomment to make test fail
//     // main(1, 1);
// }
