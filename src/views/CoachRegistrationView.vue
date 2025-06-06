<template>
  <div class="registration-container d-flex justify-content-center align-items-center min-vh-100">
    <div class="registration-box p-4 shadow-lg">

      <AlertError :error-message="errorMessage" />
      <AlertSuccess :success-message="successMessage" />

      <ClientRegistration
          :customer-profile="coachProfile"
          :password-retype="passwordRetype"
          @event-update-firstname="setCoachProfileFirstName"
          @event-update-lastname="setCoachProfileLastName"
          @event-update-email="setCoachProfileEmail"
          @event-update-date-of-birth="setCoachProfileDateOfBirth"
          @event-update-gender="setCoachProfileGender"
          @event-update-password="setCoachProfilePassword"
          @event-update-retyped-password="setRetypedPassword"
      />

      <CoachRegistration
          :coach-profile="coachProfile"
          @event-update-description="setCoachProfileDescription"
          @event-update-phone-number="setCoachProfilePhoneNumber"
          @event-new-image-selected="setCoachProfileCoachImage"
          :sports="sports"
          @event-update-checked-sport="setCoachSportId"
      />

      <CoachImage
          :image-data="coachProfile.imageData"
          @event-update-coach-image="$emit('event-update-coach-image', $event)"
      />

      <div class="d-grid gap-2 mt-4">
        <button @click="addNewCoach" type="button" class="btn btn-danger">
          Loo konto
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import AlertError from "@/components/alert/AlertError.vue";
import CoachRegistration from "@/components/registration/CoachRegistration.vue";
import ClientRegistration from "@/components/registration/ClientRegistration.vue";
import ErrorCodes from "@/errors/ErrorCodes";
import RegistrationServices from "@/services/RegistrationServices";
import AlertSuccess from "@/components/alert/AlertSuccess.vue";
import SportService from "@/services/SportService";
import Navigation from "@/navigation/Navigation";
import CoachSportService from "@/services/CoachSportService";
import CoachImage from "@/components/image/CoachImage.vue";


export default {
  name: 'CoachRegistrationView',
  components: {CoachImage, ClientRegistration, AlertError, CoachRegistration, AlertSuccess},

  data() {
    return {
      sportIds:[],

      errorMessage: '',
      successMessage: '',

      errorResponse: {
        message: '',
        errorCode: 0
      },

      coachProfile: {
        firstName: '',
        lastName: '',
        email: '',
        dateOfBirth: '',
        gender: '',
        password: '',
        phoneNumber: '',
        description: '',
        imageData: '',
      },

      userId: 0,
      sports: [
        {
          sportId: 0,
          sportName: '',
          available: false
        }
      ],


    }
  },
  methods: {


    setCoachSportId(sportInfo) {
      let sportId = sportInfo.sportId
      let isAvailable = sportInfo.available
      for (let i = 0; i< this.sports.length; i++) {
        if (this.sports[i].sportId === sportId) {
          this.sports[i].available = isAvailable
          if (isAvailable && !this.sportIds.includes(sportId)) {
            this.sportIds.push(sportId);
          } else if (!isAvailable) {

            this.sportIds = this.sportIds.filter(id => id !== sportId);
          }

          break;
        }
      }
    },
    setCoachProfileDescription(description) {
      this.coachProfile.description = description
    },
    setCoachProfilePhoneNumber(phoneNumber) {
      this.coachProfile.phoneNumber = phoneNumber
    },
    setCoachProfileCoachImage(coachImage) {
      this.coachProfile.imageData = coachImage
    },
    setCoachProfileGender(gender) {
      this.coachProfile.gender = gender
    },
    setCoachProfileFirstName(firstName) {
      this.coachProfile.firstName = firstName
    },
    setCoachProfileLastName(lastName) {
      this.coachProfile.lastName = lastName
    },
    setCoachProfileEmail(email) {
      this.coachProfile.email = email
    },
    setCoachProfileDateOfBirth(dateOfBirth) {
      this.coachProfile.dateOfBirth = dateOfBirth
    },
    setCoachProfilePassword(password) {
      this.coachProfile.password = password
    },
    setRetypedPassword(passwordRetype) {
      this.passwordRetype = passwordRetype
    },
    handleAddNewCustomerErrorResponse(error) {
      this.errorResponse = error.response.data
      if (error.response.status === 403 && this.errorResponse.errorCode === ErrorCodes.CODE_EMAIL_UNAVAILABLE) {
        this.setTimedOutErrorMessage(this.errorResponse.message)
      }
    },
    addNewCoach() {
      this.validateUserCorrectInput()
      if (this.errorMessage === '') {

        RegistrationServices.sendPostNewCoachRequest(this.coachProfile).then(response => {

          this.userId = response.data
          const coachSportPayload = {
            userId: this.userId,
            sportIds: this.sportIds
          };

          CoachSportService.sendPostCoachSportRequest(coachSportPayload)
              .then(() => this.handleAddNewCustomerResponse())
              .catch(error => this.handleAddNewCustomerErrorResponse(error));
        }).catch(error => this.handleAddNewCustomerErrorResponse(error));


      }

    },

    handleAddNewCustomerResponse() {
      this.setTimedOudSuccessMessage('Uus treener edukalt lisatud')
      this.resetAllFields()
    },


    resetAllFields() {
      this.coachProfile.firstName = ''
      this.coachProfile.lastName = ''
      this.coachProfile.email = ''
      this.coachProfile.dateOfBirth = ''
      this.coachProfile.gender = ''
      this.coachProfile.password = ''
      this.passwordRetype = ''
      this.coachProfile.description = ''
      this.coachProfile.phoneNumber = ''
      this.coachProfile.imageData = ''
      // this.coachSport = {
      //   userId: 0,
      //   sports: []
      // }


    },
    validateUserCorrectInput() {
      if (!this.isNameValid(this.coachProfile.firstName)) {
        this.setTimedOutErrorMessage('Eesnimi peab olema vähemalt 3 tähemärki ja tohib sisldada tähti ning vajadusel sidekriipsu')
      } else if (this.coachProfile.lastName.length < 3 && !this.isNameValid(this.coachProfile.lastName)) {
        this.setTimedOutErrorMessage('Perekonnanimi peab olema vähemalt 3 tähemärki ja tohib sisldada tähti ning vajadusel sidekriipsu')
      } else if (!this.isEmailValid(this.coachProfile.email)) {
        this.setTimedOutErrorMessage('Ebakorrektne emaili aadress')
      } else if (this.coachProfile.dateOfBirth.length === 0) {
        this.setTimedOutErrorMessage('Sünnikuupäev on valimata')
      } else if (this.coachProfile.gender.length === 0) {
        this.setTimedOutErrorMessage('Sugu on valimata')
      } else if (this.isPasswordValid(this.coachProfile.password)) {
        this.setTimedOutErrorMessage('Paroolid peab olema vähemalt 8 tähemärki')
      } else if (this.passwordRetype !== this.coachProfile.password) {
        this.setTimedOutErrorMessage('Paroolid ei kattu')
      } else if (this.coachProfile.description.length < 10) {
        this.setTimedOutErrorMessage('Kirjeldus peab olema vähemalt 10 tähemärki!')
      } else if (this.coachProfile.phoneNumber.length < 5 && !this.isPhoneValid(this.coachProfile.phoneNumber)) {
        this.setTimedOutErrorMessage('Sisesta korrektne number')
      } else if (this.coachProfile.imageData == null || this.coachProfile.imageData === '') {
        this.setTimedOutErrorMessage('Pilt peab olema lisatud');
      }


    },
    isNameValid(name) {
      return /^[\p{L}\s-]+$/u.test(name)
    },
    isEmailValid(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },
    isPhoneValid(phoneNumber) {
      return /^[^[5-9][0-9]{6,7}$/.test(phoneNumber)
    },
    isPasswordValid(password) {
      return /^.{8,}$/.test(password)
    },


    setTimedOutErrorMessage(message) {
      this.errorMessage = message
      setTimeout(this.resetMessage, 4000)
    },

    setTimedOudSuccessMessage(message) {
      this.successMessage = message
      setTimeout(this.resetMessage, 4000)
    },
    resetMessage() {
      this.errorMessage = ''
      this.successMessage = ''

    },

    getAllSports() {
      SportService.sendGetSportsRequest()
          .then(response => this.handleGetSportsResponse(response))
          .catch(() => Navigation.navigateToErrorView());
    },

    handleGetSportsResponse(response) {
      this.sports = response.data
    },
  },

  beforeMount() {
    this.getAllSports()

  }


}
</script>
