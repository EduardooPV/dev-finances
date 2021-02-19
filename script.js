// Criar / excluir o MODAL
const Modal = {
    open() {
        // Abrir modal
        // Adicionar a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },
    close() {
        // Fechar modal
        // Remover a classe active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const ModalConfirm = {
    open() {
        // Abrir modal
        // Adicionar a classe active ao modal
        document
            .querySelector('.modal-overlay.confirm')
            .classList.add('active')
    },
    close() {
        // Fechar modal
        // Remover a classe active ao modal
        document
            .querySelector('.modal-overlay.confirm')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    // Somar as entradas 
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },

    // Somaras saídas
    expenses() {
        expense = 0
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    // Total, entradas - saídas
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

// Tabela com o extrato de valores de entrada e saida.
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <a href="#" onclick="ModalConfirm.open()" class="button new"><img style="width: 1.5rem;" src="assets/minus1.svg" alt="Confirmar exclusão"></a>
        `
        return html
    },

    deleteconfirm() {
        buttonconfirm = document.querySelector('#deleteconfirm')

    },

    updateBalance() {
        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Transformar os valores de entrada e saida em REAL ( - R$ 2000,00 )
const Utils = {

    formatAmount(value) {
        value = Number(value) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },


    validateField() { // Validar se os campos estão preenchidos
        const { description, amount, date} = Form.getValues()
        
        if (
            description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos")  // Tratando os erros
        }
    },

    formatValues() {
        let { description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description, 
            amount,
            date
        }
    },

    saveTransaction(transaction) {
        Transaction.add(transaction)
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
         // Interrompendo o comportamento padrão do Formulário ao clicar em "SALVAR"
        event.preventDefault() 



        try {
            Form.validateField()  // Verificar os campos, vazios ou preenchidos

            const transaction = Form.formatValues()  // Pegar a transação formatada
            Transaction.add(transaction) // Adicionar Transação

            Form.clearFields()

            Modal.close()

        } catch (error) {
            alert(error.message)
        }

    }
}

const App = {
    init() {
        // Exibir o resultado da tabela formatada no HTMl
        Transaction.all.forEach(function (transaction, index) {
            DOM.addTransaction(transaction, index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

// Iniciar a aplicação
App.init()