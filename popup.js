function getSubscription({ eventRef, eventName, observer }) {
  const observable$ = Rx.Observable.fromEvent(eventRef, eventName);
  observable$.subscribe(observer);
}

function getEventAttached({
  elementIdentifier,
  selectorType,
  eventName,
  observer,
}) {
  var selectedElement;

  switch (selectorType) {
    case "id": {
      selectedElement = document.getElementById(elementIdentifier);
      break;
    }

    case "class": {
      selectedElement = document.getElementById(elementIdentifier);
      break;
    }
  }

  const subscriptionPayload = {
    eventRef: selectedElement,
    eventName,
    observer,
  };

  getSubscription(subscriptionPayload);
}

window.onload = function () {
  const searchBar = document.getElementById("search");
  const defaultHostname = "https://www-latest.practo.com/";
  var hostname = defaultHostname;
  var suffix = "",
    openAllArray = [];

  var sequenceNumber;

  chrome.storage.sync.get("savedSequenceNumber", function (storage) {
    const { savedSequenceNumber = 1 } = storage;
    sequenceNumber = savedSequenceNumber;
  });

  const observer = {
    next: function (value) {
      chrome.storage.sync.get("extensionData", function (storage) {
        const { extensionData: data = [] } = storage;
        const allBadge = document.querySelectorAll(".badge");
        var searchingTags = [];

        chrome.storage.sync.get("primarySearchTag", function (storage) {
          const { primarySearchTag = [] } = storage;
          console.log(storage);
          searchingTags = primarySearchTag;
        });

        if (allBadge) {
          allBadge.forEach((ele) => {
            searchingTags.push({
              name: ele.textContent,
            });
          });
        }

        if (searchBar.value) {
          searchingTags.push({
            name: searchBar.value,
          });
        }

        chrome.storage.sync.set({ primarySearchTag: searchingTags });

        const options = {
          useExtendedSearch: true,
          includeScore: true,
          keys: ["name"],
        };

        const possibleResults = data;

        const fuse = new Fuse(possibleResults, options);

        const seached_array = fuse.search({
          $or: searchingTags,
        });

        const accordian_container = document.getElementById("accordion");
        const body = document.querySelector("body");
        if (accordian_container) {
          accordian_container.remove();
        }

        const accordianBody = document.getElementById("accordian-body");

        accordianBody.insertAdjacentHTML(
          "beforeend",
          '<div class="accordion m-3" id="accordion"></div>'
        );
        seached_array.forEach((ele) => {
          const element = ele.item.name;
          var p = document.getElementById("accordion"); // is a node
          p.insertAdjacentHTML(
            "beforeend",
            `
                <div class="accordion-item">
                  <h2 class="accordion-header" id="heading${element}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${element}" aria-expanded="false" aria-controls="collapse${element}">
                      ${element.replaceAll("-", " ")}
                    </button>
                  </h2>
                  <div id="collapse${element}" class="accordion-collapse collapse" aria-labelledby="heading${element}" data-bs-parent="#accordion">
                  <div>  
                  <div class="input-group search m-3 search-container">
                      <div id="search-div" type="text" class="form-control d-flex" placeholder="Search Common Name"
                          aria-label="Recipient's username" aria-describedby="basic-addon2">
                          <div id="secondary-tag-badge${element}" class="d-flex">
                          </div>
                          <input id="secondarySearch${element}" type="text" class="form-control shadow-none border-0" placeholder="Search Common Name"
                          aria-label="Recipient's username" aria-describedby="basic-addon2">
                      </div>
                      <div class="input-group-append">
                          <span id="secondaryAddTag${element}" class="input-group-text rounded-0 h-100">Add Tag</span>
                      </div>
                    </div>
                    </div>
                    <button id="secondary-clear-all${element}" class="btn btn-danger clear-all" type="button" > clear </button>
                    <div class="accordion-body">
                      <div class="list-group" id="links${element}">
                      </div>
                    </div>
                  </div>
                </div>
                `
          );

          const secondarySearchBar = document.getElementById(
            `secondarySearch${element}`
          );
          const secondarySearchBar$ = Rx.Observable.fromEvent(
            secondarySearchBar,
            "keyup"
          );

          const secondaryClearAll = document.getElementById(
            `secondary-clear-all${element}`
          );

          const secondaryClearAll$ = Rx.Observable.fromEvent(
            secondaryClearAll,
            "click"
          );

          const secondaryAddTag = document.getElementById(
            `secondaryAddTag${element}`
          );
          const secondaryTagBadge = document.getElementById(
            `secondary-tag-badge${element}`
          );

          if (secondaryAddTag) {
            const secondaryAddTag$ = Rx.Observable.fromEvent(
              secondaryAddTag,
              "click"
            );

            secondaryAddTag$.subscribe(() => {
              if (secondarySearchBar.value) {
                secondaryTagBadge.insertAdjacentHTML(
                  "beforeend",
                  `<button disabled type="button" class="btn btn-warning secondary-badge">${secondarySearchBar.value}</button>`
                );
                secondarySearchBar.value = "";
              }
            });
          }

          const activeLinks = data.find((temp) => temp.name == element);
          function updateUrlsOnSearch() {
            const modifiedSearchArray = activeLinks.urls.map((element) => {
              return { url: element };
            });

            const secondaryAllBadge =
              document.querySelectorAll(".secondary-badge");
            const secondarySearchingTags = [];

            const secondaryOptions = {
              useExtendedSearch: true,
              includeScore: true,
              keys: ["url"],
            };

            if (secondaryAllBadge) {
              secondaryAllBadge.forEach((ele) => {
                secondarySearchingTags.push({
                  url: ele.textContent,
                });
              });
            }

            if (secondarySearchBar.value) {
              secondarySearchingTags.push({
                url: secondarySearchBar.value,
              });
            }

            secondaryClearAll$.subscribe(() => {
              secondaryTagBadge.innerHTML = null;
              secondarySearchingTags = [];
              updateUrlsOnSearch();
            });

            const fuse = new Fuse(modifiedSearchArray, secondaryOptions);
            const secondarySeachedArray = fuse.search({
              $or: secondarySearchingTags,
            });

            const finalSecondarySearch = secondarySeachedArray.map(
              (element) => element.item.url
            );

            const modifiedActiveLinks = {
              ...activeLinks,
              urls: finalSecondarySearch,
            };

            if (
              secondarySearchingTags.length == 0 &&
              !secondarySearchBar.value
            ) {
              modifiedActiveLinks.urls = activeLinks.urls;
            }

            updateLinkList(
              modifiedActiveLinks.name,
              modifiedActiveLinks.urls,
              activePage
            );
          }

          secondarySearchBar$.subscribe(() => {
            updateUrlsOnSearch();
          });

          const links = document.getElementById(`links${element}`);

          function updateLinkList(commonName, linkList, activePage) {
            links.innerHTML = "";
            let perPageUrls = parseInt(linkList.length / 5);
            perPageUrls = perPageUrls < 5 ? 5 : perPageUrls;
            linkList
              .slice((activePage - 1) * perPageUrls, activePage * perPageUrls)
              .forEach((url, index) => {
                const isSelected = !!openAllArray.find(
                  (selectedUrl) => selectedUrl == url
                );
                links.insertAdjacentHTML(
                  "beforeend",
                  `<li id=${
                    url + commonName
                  } href=${url} class="d-inline-flex justify-content-between list-group-item list-group-item-warning accordian_element_url">
                      <div class="w-100 link_url" id="link_url${
                        url + commonName
                      }">
                        ${url}
                      </div>
                      <div id="copyButton${
                        url + commonName
                      }" class="w-25 d-inline-flex justify-content-center">
                        <button type="button" class="btn btn-success">copy</button>
                      </div>
                    </li>`
                );

                const urlEventListener = document.getElementById(
                  url + commonName
                );
                const urlObservable$ = Rx.Observable.fromEvent(
                  urlEventListener,
                  "click"
                );
                urlObservable$.subscribe(() => {
                  window.open(hostname + url + suffix);
                });

                const copyButtonListener = document.getElementById(
                  `copyButton${url + commonName}`
                );
                const copyButtonObservable$ = Rx.Observable.fromEvent(
                  copyButtonListener,
                  "click"
                );
                copyButtonObservable$.subscribe((event) => {
                  event.stopPropagation();
                  const copingText = document.getElementById(
                    `link_url${url + commonName}`
                  );
                  navigator.clipboard.writeText(
                    hostname + copingText.textContent + suffix
                  );
                });
              });

            const pageCountPerPage = perPageUrls < 5 ? 5 : perPageUrls;

            const paginationCount =
              parseInt(linkList.length / pageCountPerPage) +
              parseInt(linkList.length % pageCountPerPage == 0 ? 0 : 1);
            links.insertAdjacentHTML(
              "beforeend",
              `<ul class="pagination justify-content-center" id="pagination${element}"></ul>`
            );

            const paginationNode = document.getElementById(
              `pagination${element}`
            );
            paginationNode.innerHTML = "";
            for (let pageCount = 0; pageCount < paginationCount; pageCount++) {
              paginationNode.insertAdjacentHTML(
                "beforeend",
                `<li class="page-item" id=${
                  element + pageCount
                } ><a class="page-link" href="#">${pageCount + 1}</a></li>`
              );
              const paginationEventListener = document.getElementById(
                element + pageCount
              );
              const urlObservable$ = Rx.Observable.fromEvent(
                paginationEventListener,
                "click"
              );
              urlObservable$.subscribe(() => {
                updateActivePage(pageCount + 1);
              });
            }
          }
          var activePage = 1;

          const updateActivePage = function (pageNumber) {
            activePage = pageNumber;
            updateUrlsOnSearch();
          };
          updateUrlsOnSearch();
        });
      });
    },
    error: function (err) {
      console.error(err);
    },
    complete: function () {
      console.log("Completed");
    },
  };
  const observable$ = Rx.Observable.fromEvent(searchBar, "keyup");
  const customizedHostName = document.getElementById("formGroupExampleInput");
  const customizedSuffix = document.getElementById("formGroupExampleInput2");
  if (customizedHostName) {
    const customizedHostNameObservable$ = Rx.Observable.fromEvent(
      customizedHostName,
      "keyup"
    );

    customizedHostNameObservable$.subscribe(() => {
      hostname = customizedHostName.value || defaultHostname;
    });
  }

  if (customizedSuffix) {
    const customizedSuffixObservable$ = Rx.Observable.fromEvent(
      customizedSuffix,
      "keyup"
    );

    customizedSuffixObservable$.subscribe(() => {
      suffix = customizedSuffix.value;
    });
  }

  const addTag = document.getElementById("addTag");
  const tagBadge = document.getElementById("tag-badge");

  chrome.storage.sync.get("primarySearchTag", function (storage) {
    const { primarySearchTag = [] } = storage;
    var sequence = sequenceNumber;
    primarySearchTag.map((element) => {
      console.log(element, "111111");
      tagBadge.insertAdjacentHTML(
        "beforeend",
        `<button id="primaryBadge${sequence++}" disabled type="button" class="d-flex align-items-center btn btn-warning badge">
          <div>${element.name}</div>
          </button>`
      );
    });
    sequenceNumber = sequence;
    chrome.storage.sync.set({ savedSequenceNumber: sequence });
    if (primarySearchTag.length) {
      observer.next();
    }
  });

  if (addTag) {
    const addTag$ = Rx.Observable.fromEvent(addTag, "click");

    addTag$.subscribe(() => {
      if (searchBar.value) {
        tagBadge.insertAdjacentHTML(
          "beforeend",
          `<button disabled type="button" class="d-flex align-items-center btn btn-warning badge">
            <div>${searchBar.value}</div>
            </button>`
        );
        chrome.storage.sync.set({ savedSequenceNumber: sequenceNumber + 1 });
        searchBar.value = "";
        sequenceNumber += 1;
        observer.next();
      }
    });
  }

  // const clearAll = document.getElementById("clear-all");

  // const clearAll$ = Rx.Observable.fromEvent(clearAll, "click");

  // clearAll$.subscribe(() => {
  //   chrome.storage.sync.set({ primarySearchTag: [] }, function () {
  //     tagBadge.innerHTML = null;
  //     observer.next();
  //   });
  // });

  function clearAllSubscriber() {
    chrome.storage.sync.set({ primarySearchTag: [] }, function () {
      tagBadge.innerHTML = null;
      observer.next();
    });
  }

  getEventAttached({
    elementIdentifier: "clear-all",
    selectorType: "id",
    eventName: "click",
    observer: clearAllSubscriber,
  });

  observable$.subscribe(observer);
};
