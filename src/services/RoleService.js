export default {
    isLoggedIn() {
        let roleName = sessionStorage.getItem('roleName')
        return roleName !== null
    },

    isAdmin() {
        let roleName = sessionStorage.getItem('roleName')
        return this.isLoggedIn() && roleName === 'admin'
    },

    isCoach() {
        let roleName = sessionStorage.getItem('roleName')
        return this.isLoggedIn() && roleName === 'coach'
    },
    isCustomer() {
        let roleName = sessionStorage.getItem('roleName')
        return this.isLoggedIn() && roleName === 'customer'
    },
}