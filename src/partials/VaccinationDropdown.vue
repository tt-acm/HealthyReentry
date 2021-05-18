<template>
  <div>
    <md-field class="mb-3">
        <label for="font">Choose the manufacturer</label>
        <md-select v-model="curVaccineManufacturer" name="vaccine" id="vaccine" placeholder="Choose the manufacturer" :md-selected="$emit('vaccineSelected', curVaccineManufacturer, curIndex)">
            <md-option value="AstraZeneca">AstraZeneca</md-option>
            <md-option value="JohnsonJohnson">Johnson & Johnson’s Janssen</md-option>
            <md-option value="Moderna">Moderna</md-option>
            <md-option value="Pfizer">Pfizer-BioNTech</md-option>
            <md-option value="CanSinoBIO">CanSinoBIO</md-option>
            <md-option value="Covishield">Covishield</md-option> 
            <md-option value="CVnCoV">CVnCoV</md-option>               
            <md-option value="Novavax">Novavax</md-option>                  
            <md-option value="Sinopharm">Sinopharm</md-option>   
            <md-option value="Other">Other</md-option>
        </md-select>
    </md-field>
  </div>
</template>

<script>
export default {
    name: 'VaccinationDropDown',
    props:["existingVaccine", "curIndex"],
    data() {
    return {
      curVaccineManufacturer: this.existingVaccine,
    };
  },
  methods: {
  },
}
</script>

<style scoped>

</style>
