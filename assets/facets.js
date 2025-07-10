class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      // console.log('debounce', event.target)

      const customSearchEl = event.target;

      if (customSearchEl.classList.contains('filter-search-inputBox')) {
        return false
      }

      this.onSubmitHandler(event);
    });

    // const facetForm = this.querySelector('form');
    // console.log("facetForm", facetForm)
    // // debugger;
    // facetForm && facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    const facetForm = this.querySelector('form');
    // console.log("facetForm", facetForm)
    // debugger;



    // const debounceOnSubmit =  this.debouncedOnSubmit.bind(this)
    facetForm && facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));


    // const facetForm = this.querySelectorAll('form input');
    // console.log("facetForm", facetForm)
    // const thisthis = this
    // facetForm.forEach(item => {   

    //   item.addEventListener('input', () => {
    //     thisthis.debouncedOnSubmit.bind(thisthis);
    //     // item.reset();
    //   });
    // })

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    // console.log("facetWrapper", facetWrapper)
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);


  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);


        // bind search functionality
        verticalFilter()
        filterData()
        mblSortContent()
      });

    console.log("sorrrrt")
  }



  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);


    // bind search functionality
    verticalFilter()
    filterData()
    mblSortContent()
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });


  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };
    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newFacetDetailsElement = document.getElementById(closestJSFilterID);
        const newElementSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
          ? `.mobile-facets__close-button`
          : `.facets__summary`;
        const newElementToActivate = newFacetDetailsElement.querySelector(newElementSelector);
        if (newElementToActivate) newElementToActivate.focus();
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    // debugger
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    // document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
    // let abbc = document.getElementById('FacetFiltersFormMobile');
    // console.log("abbc",abbc)
    // document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
    console.log("mysorrrt")
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }






  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
    verticalFilter()
  }

  onSubmitHandler(event) {
    // debugger
    event.preventDefault();
    const filterSearchFields = this.querySelectorAll('.filter-search-inputBox');

    // console.log("filterSearchFields", filterSearchFields)
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });

      // Check if the clicked .list-menu__item.facets__item has a child with the 'active' class
      const clickedElement = event.target.closest('.list-menu__item.facets__item');
      if (clickedElement && clickedElement.querySelector('.active')) {
        // Check if any span in facet-remove contains the input value
        const inputValue = event.target.closest('input').value;
        const facetRemoves = document.querySelectorAll('facet-remove');

        facetRemoves.forEach((facetRemove) => {
          const facetLink = facetRemove.querySelector('a');
          const span = facetLink.querySelector('span');

          if (span && span.textContent.includes(inputValue)) {
            facetLink.click(); // Simulate a click on the facetLink element
          }
        });
      }

      this.onSubmitForm(forms.join('&'), event);
    }


    console.log("sort submit")
  }




  onActiveFilterClick(event) {
    // event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input:not(.non-filter-input)').forEach((element) =>
      element.addEventListener('change', this.onRangeChange.bind(this))
    );
    this.setMinAndMaxValues();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      // event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    const unCheck = document.querySelectorAll(".label_container input").forEach(item => {
      item.checked = false
    });
    form.onActiveFilterClick(event);

    console.log('removed', form);
  }
}

customElements.define('facet-remove', FacetRemove);





// Vertical Filter Facets 
function verticalFilter() {

  let filterTitleVertical = document.querySelectorAll('.hf-filter-content-title');
  let filtervalue = document.querySelectorAll('.hf-filter-content-value');


  function handleFilteringVertical(titleElement) {
    filterTitleVertical.forEach((otherTitleElementVertical) => {
      otherTitleElementVertical.classList.remove("title-active");
    });

    // titleElement.classList.add("title-active");
    let titleAttr = titleElement.getAttribute("filltitle");
    filtervalue.forEach((valueElementVertical) => {
      let valueAttr = valueElementVertical.getAttribute("filltitle");
      if (titleAttr === valueAttr) {
        if (valueElementVertical.classList.contains("cstm-hide")) {
          valueElementVertical.classList.remove("cstm-hide");
          titleElement.classList.add("title-active");
        }
        else {
          valueElementVertical.classList.add("cstm-hide");
          titleElement.classList.remove("title-active");
        }
      }
      else {
        valueElementVertical.classList.add("cstm-hide");
      }
    });
  }

  filterTitleVertical.forEach((titleElement) => {
    titleElement.addEventListener("click", function () {
      handleFilteringVertical(titleElement);
    });
  });

  // if (filterTitleVertical.length > 0) {
  //   handleFilteringVertical(filterTitleVertical[0]);
  // }

}
// Facets Mobile

verticalFilter()

function mobileFilter() {
  let filterTitleMbl = document.querySelectorAll(".filter-content-title");
  let filtervalueMbl = document.querySelectorAll(".filter-content-value");

  // Function to handle filtering
  function handleFiltering(titleElement) {
    filterTitleMbl.forEach((otherTitleElement) => {
      otherTitleElement.classList.remove("title-active");
    });

    titleElement.classList.add("title-active");
    let titleAttr = titleElement.getAttribute("filltitle");
    filtervalueMbl.forEach((valueElement) => {
      let valueAttr = valueElement.getAttribute("filltitle");
      if (titleAttr === valueAttr) {
        valueElement.classList.remove("cstm-hide");
      } else {
        valueElement.classList.add("cstm-hide");
      }
    });
  }

  filterTitleMbl.forEach((titleElement) => {
    titleElement.addEventListener("click", function () {
      handleFiltering(titleElement);
    });
  });

  if (filterTitleMbl.length > 0) {
    handleFiltering(filterTitleMbl[0]);
  }
}

mobileFilter()

function filterData() {
  let facetsDisclosure = document.querySelectorAll(".facets__disclosure-vertical");
  facetsDisclosure.forEach((inputBox) => {
    let inputValue = inputBox.querySelector(".filter-search-inputBox");
    inputValue && inputValue.addEventListener("input", function () {
      let searchTerm = inputValue.value.toLowerCase().trim();
      let parentContainer = inputValue.closest(".facets__disclosure-vertical");
      let listItems = parentContainer.querySelectorAll(".facets-layout-list li.list-menu__item");
      listItems.forEach((item) => {
        let itemValue = item.querySelector("input").value.toLowerCase().trim();
        if (itemValue.includes(searchTerm)) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });


    magnifierBtn = inputBox.querySelector(".button-wrap .mag-btn");
    closeBtn = inputBox.querySelector(".button-wrap .close-btn");

    let filterSearchbox = inputBox.querySelector(".filter-search-filterSearchBox");
    let filterInput = inputBox.querySelector(".filter-search-inputBox");

    magnifierBtn && magnifierBtn.addEventListener("click", function () {
      filterSearchbox.classList.add("filter-search-expanded");
      filterInput.classList.remove("filter-search-hidden");
      this.classList.add("cstm-hide")
      let wrapbtn = this.closest(".button-wrap");
      wrapbtn.querySelector(".close-btn").classList.remove("cstm-hide")


    })
    closeBtn && closeBtn.addEventListener("click", function () {
      filterSearchbox.classList.remove("filter-search-expanded");
      filterInput.classList.add("filter-search-hidden");
      this.classList.add("cstm-hide")
      let wrapbtn = this.closest(".button-wrap");
      wrapbtn.querySelector(".mag-btn").classList.remove("cstm-hide")

    })
  })
}
filterData()



function mblSortContent(){

  let sortRow = document.querySelectorAll('.sort-row li');
  const selectElement = document.querySelector('#SortBy-mobile');
  let formsubmit = document.querySelector("#FacetFiltersForm")
    let sortBtnMbl = document.querySelector('#sort-mbl-btn');
    let sortWrapper = document.querySelector('.cstm-sort-main-wrapper');
    let sortGradient = document.querySelector('.sort-bg-gradient');
    
    
    sortBtnMbl && sortBtnMbl.addEventListener('click', function () {
      sortWrapper.classList.remove("hidden")
      sortGradient.classList.remove("hidden")
    })

    sortRow.forEach((sort) => {
      sort.addEventListener('click', function () {
        let sortAttr = sort.getAttribute('opt_value');

        let selectOption = document.querySelector('.mobile-facets__sort select');
        let selectOptionList = selectOption.querySelectorAll('option');
        selectOptionList.forEach((option) => {
          let optionValue = option.value;
          if (sortAttr == optionValue) {
            selectOption.value = optionValue;
            formsubmit.dispatchEvent(new Event('input'));
            sortWrapper.classList.add("hidden")
            sortGradient.classList.add("hidden")
          }
        });
      });
    });

}
    



mblSortContent()