/* eslint-disable prefer-const */

export const validateCPF = (cpf: string): boolean => {
    cpf = cpf.replace(/\D/g, ""); 
  
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
    const calculateDigit = (factor: number) =>
      Array.from(cpf)
        .slice(0, factor - 1)
        .reduce((sum, num, index) => sum + parseInt(num) * (factor - index), 0);
  
    const digit1 = (calculateDigit(10) * 10) % 11 % 10;
    const digit2 = (calculateDigit(11) * 10) % 11 % 10;
  
    return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
};

export const validateCNPJ = (cnpj: string): boolean => {
    cnpj = cnpj.replace(/\D/g, "");

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length += 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};
  
export const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, ""); 
    return cleaned.length === 11; 
};

export const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return regex.test(email);
};
