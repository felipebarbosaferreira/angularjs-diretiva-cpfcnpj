/**
 * Created by fbferreira on 15/12/2017.
 */
/* Diretiva para aplicar mascara CPF e CNPJ
 *   CPF.: 11 digitos e com a mascara 14 digitos -> 123.456.789-12
 *   CNPJ: 14 digitos e com a mascara 18 digitos -> 12.345.678/9000-00
 *
 *   Aplica a mascara na view e para o model o valor SEM a mascara. Para que o model tambem
 *     tenha o valor COM a mascara usar: model-mask="true" . Ver demais opcoes abaixo.
 *
 *   Parametros opcionais:
 *       modelMask:
 *           valor aceito ( TRUE )
 *           se informado o valor passado para o model possui mascara
 *       validateDigit:
 *           valor aceito ( TRUE )
 *           se informado o CPF ou CNPJ sera validado tambem
 *
 *   Modo de usar:
 *      <input ... mask-cpf-cnpj maxlength="18"/>
 *          Resultado: view: 123.456.789-12
 *                    model: 12345678912
 *
 *      <input ... mask-cpf-cnpj model-mask="true" maxlength="18"/>
 *          Resultado: view: 123.456.789-12
 *                    model: 123.456.789-12
 * */
'use strict';

function maskCpfCnpj () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            modelMask: '=?',
            validateDigit: '=?'
        },
        link: function(scope, element, attrs, ngModelController) {

            function applyValueFromView (value) {
                let resultApplyValueFromView = "";

                if ((typeof(value) == typeof(undefined)) || (!value)) {
                    resultApplyValueFromView = value;
                } else {
                    let viewValue = applyMask(value);

                    resultApplyValueFromView = renderValueOnView(viewValue);
                }

                return resultApplyValueFromView;
            }

            function applyValueFromModel(value) {
                let resultApplyValueFromModel = "";

                if ((typeof(value) == typeof(undefined)) || (!value)) {
                    resultApplyValueFromModel = value;
                } else {
                    let modelValue = removeCharacters(value);
                    ngModelController.$modelValue = modelValue;
                    resultApplyValueFromModel = applyMask(modelValue);
                }

                return resultApplyValueFromModel;
            }

            function applyMask(value) {
                let resultApplyMask = "";
                let onlyNumbers = removeCharacters(value);
                let validateCpf = true;
                let validateCnpj = true;

                if (onlyNumbers.length > 14) {
                    resultApplyMask = only18digits(value);
                } else {
                    if (onlyNumbers.length > 11) {
                        resultApplyMask = doMaskCnpj(onlyNumbers);
                        if (scope.validateDigit) {
                            validateCnpj = testCnpj(onlyNumbers);
                        }
                    } else {
                        resultApplyMask = doMaskCpf(onlyNumbers);
                        if (scope.validateDigit) {
                            validateCpf = testCpf(onlyNumbers);
                        }
                    }
                }

                return resultApplyMask;
            }

            function removeCharacters(value) {
                return value.toString().replace(/[^0-9]/g, '');
            }

            function only18digits(value) {
                return value.toString().substr(0,18);
            }

            function doMaskCnpj(value) {
                let valueWithMaskCnpj = "";

                valueWithMaskCnpj = value.toString().substr(0,2).concat('.');
                valueWithMaskCnpj = valueWithMaskCnpj.concat(value.toString().substr(2,3).concat('.'));
                valueWithMaskCnpj = valueWithMaskCnpj.concat(value.toString().substr(5,3).concat('/'));
                valueWithMaskCnpj = valueWithMaskCnpj.concat(value.toString().substr(8,4).concat('-'));
                valueWithMaskCnpj = valueWithMaskCnpj.concat(value.toString().substr(12,2));

                return valueWithMaskCnpj;
            }

            function doMaskCpf(value) {
                var valueWithMaskCpf = value.toString().replace(/(.{3})/g, '$1.');

                if (value.length > 9) {
                    valueWithMaskCpf = valueWithMaskCpf.replace(/.([^.]*)$/, '-$1');
                }

                return valueWithMaskCpf;
            }

            function renderValueOnView(valueToView) {
                ngModelController.$viewValue = valueToView;
                ngModelController.$render();

                let valueToModel = "";

                if (scope.modelMask) {
                    valueToModel = valueToView;
                } else {
                    valueToModel = removeCharacters(valueToView);
                }

                return valueToModel;
            }

            function testCpf(onlyNumbersCpf) {
                // base code from: https://www.devmedia.com.br/validar-cpf-com-javascript/23916
                let resultTestCpf = true;
                let soma = 0;
                let resto;

                if (   onlyNumbersCpf == "00000000000"
                    || onlyNumbersCpf == "11111111111"
                    || onlyNumbersCpf == "22222222222"
                    || onlyNumbersCpf == "33333333333"
                    || onlyNumbersCpf == "44444444444"
                    || onlyNumbersCpf == "55555555555"
                    || onlyNumbersCpf == "66666666666"
                    || onlyNumbersCpf == "77777777777"
                    || onlyNumbersCpf == "88888888888"
                    || onlyNumbersCpf == "99999999999"
                    || (onlyNumbersCpf.length != 11)) resultTestCpf = false;

                // tests the first check digit
                if (resultTestCpf) {
                    for (let i=1; i<=9; i++) soma = soma + parseInt(onlyNumbersCpf.substring(i-1, i)) * (11 - i);
                    resto = (soma * 10) % 11;

                    if ((resto == 10) || (resto == 11))  resto = 0;
                    if (resto != parseInt(onlyNumbersCpf.substring(9, 10)) ) resultTestCpf = false;
                }

                // tests the second check digit
                if (resultTestCpf) {
                    soma = 0;
                    for (let i = 1; i <= 10; i++) soma = soma + parseInt(onlyNumbersCpf.substring(i-1, i)) * (12 - i);
                    resto = (soma * 10) % 11;

                    if ((resto == 10) || (resto == 11)) resto = 0;
                    if (resto != parseInt(onlyNumbersCpf.substring(10, 11) ) ) resultTestCpf = false;
                }

                // set the form field valid or not
                setValidityToFormField(resultTestCpf);

                return resultTestCpf;
            }

            function testCnpj(onlyNumbersCnpj) {
                // base code from: http://www.geradorcnpj.com/javascript-validar-cnpj.htm
                let resultTestCnpj = true;

                if (   onlyNumbersCnpj == "00000000000000"
                    || onlyNumbersCnpj == "11111111111111"
                    || onlyNumbersCnpj == "22222222222222"
                    || onlyNumbersCnpj == "33333333333333"
                    || onlyNumbersCnpj == "44444444444444"
                    || onlyNumbersCnpj == "55555555555555"
                    || onlyNumbersCnpj == "66666666666666"
                    || onlyNumbersCnpj == "77777777777777"
                    || onlyNumbersCnpj == "88888888888888"
                    || onlyNumbersCnpj == "99999999999999"
                    || (onlyNumbersCnpj.length != 14)) resultTestCnpj = false;

                // tests the first check digit
                let tamanho = onlyNumbersCnpj.length - 2;
                let numeros = onlyNumbersCnpj.substring(0,tamanho);
                let primeiroDigitoVerificador = onlyNumbersCnpj.substring(12, 13);
                let segundoDigitoVerificador = onlyNumbersCnpj.substring(13);
                let soma = 0;
                let pos = tamanho - 7;
                let resultado = 0;

                if (resultTestCnpj) {
                    for (let i = tamanho; i >= 1; i--) {
                        soma += numeros.charAt(tamanho - i) * pos--;
                        if (pos < 2)
                            pos = 9;
                    }
                    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                    if (resultado != primeiroDigitoVerificador) resultTestCnpj = false;
                }

                // tests the second check digit
                if (resultTestCnpj) {
                    resultado = 0;
                    tamanho = tamanho + 1;
                    numeros = onlyNumbersCnpj.substring(0,tamanho);
                    soma = 0;
                    pos = tamanho - 7;
                    for (let i = tamanho; i >= 1; i--) {
                        soma += numeros.charAt(tamanho - i) * pos--;
                        if (pos < 2)
                            pos = 9;
                    }
                    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
                    if (resultado != segundoDigitoVerificador) resultTestCnpj = false;
                }

                // set the form field valid or not
                setValidityToFormField(resultTestCnpj);

                return resultTestCnpj;
            }

            function setValidityToFormField(valid) {
                if (valid) {
                    ngModelController.$setValidity("CPF/CNPJ inválido", true);
                } else {
                    ngModelController.$setValidity("CPF/CNPJ inválido", false);
                }
            }

            ngModelController.$parsers.push(applyValueFromView);
            ngModelController.$formatters.push(applyValueFromModel);
        }
    }
};

export default angular.module('maskCpfCnpj', [])
    .directive('maskCpfCnpj', maskCpfCnpj);