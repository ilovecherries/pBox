import { isValidHexColor } from './color'

test('invalid color string input', () => {
    expect(isValidHexColor('green')).toBe(false)
})

test('3 letter capital hex color without #', () => {
    expect(isValidHexColor('FFF')).toBe(false)
})

test('3 letter capital hex color with #', () => {
    expect(isValidHexColor('#DEF')).toBe(true)
})

test('3 letter capital hex color without #', () => {
    expect(isValidHexColor('FFF')).toBe(false)
})

test('3 letter lowercase hex color with #', () => {
    expect(isValidHexColor('#faf')).toBe(true)
})

test('3 letter mixed-case hex color with #', () => {
    expect(isValidHexColor('#aBc')).toBe(true)
})

test('6 letter capital hex color without #', () => {
    expect(isValidHexColor('FFFFFF')).toBe(false)
})

test('6 letter capital hex color with #', () => {
    expect(isValidHexColor('#FFFFFF')).toBe(true)
})

test('6 letter lowercase hex color with #', () => {
    expect(isValidHexColor('#ffffff')).toBe(true)
})

test('6 letter mixed-case hex color with #', () => {
    expect(isValidHexColor('#aBcDeF')).toBe(true)
})