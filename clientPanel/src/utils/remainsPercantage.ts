const remainsPercantage = (amount: number, part: number) => {
    return 100 - (part / amount) * 100
}

export { remainsPercantage }