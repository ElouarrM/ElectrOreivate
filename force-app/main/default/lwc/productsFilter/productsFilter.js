import { LightningElement } from 'lwc';
import getWrappedProducts from '@salesforce/apex/LC_allProducts.getWrappedProducts';

export default class ProductsFilter extends LightningElement {
    selectedCategory = '';
    selectedPrice = 100000 ;

    selectedAvailability = null;
    
    categoryOptions = [
        { label: 'TV', value: 'TV' },
        { label: 'PC', value: 'PC' },
        { label: 'Accessoires', value: 'Accessoires' },
        { label: 'Tablettes', value: 'Tablette' },
        { label: 'Téléphone', value: 'Telephone' },
    ];


    availabilityOptions = [
        { label: 'Disponible', value: 'true' },
        { label: 'Non disponible', value: 'false' },
    ];

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
        this.handleSearchClick();
    }

    handlePriceChange(event) {
        this.selectedPrice = event.detail.value;
        this.handleSearchClick();
    }

    handleAvailabilityChange(event) {
        this.selectedAvailability = event.detail.value;
        this.handleSearchClick();
    }
    
    handleSearchClick() {

        // Dispatch un événement custom avec la catégorie, le prix, et la disponibilité sélectionnés
        const filterChangeEvent = new CustomEvent('filterchange', {
            detail: {
                category: this.selectedCategory,
                price: this.selectedPrice, 
                availability: this.selectedAvailability,
            },
        });
        this.dispatchEvent(filterChangeEvent);

        // Effectuer la requête Apex pour récupérer les produits filtrés
        getWrappedProducts({ 
            categoryFilter: this.selectedCategory,
            priceFilter: this.selectedPrice,
            availabilityFilter: this.selectedAvailability,
        })
        .then(result => {
            const filterResultsEvent = new CustomEvent('filterresults', { detail: { products: result } });
            this.dispatchEvent(filterResultsEvent);
        })
        .catch(error => {
            console.error(error);
        });
    }
}