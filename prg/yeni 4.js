var url = window.location.href;
let ShopName = "";
let ShopId = "";
let StarSeller = 0;
let UrunlerC = 0;
let Fav = 0;
let StoreText = "";
let SalesCount = 0;
let SoldButtonVar = 0;
let SinceDate = 0;
let LastUpDate = "";
let userName = "";
let userProfileLink = "";

let Urunler = [];
let DownloadType = [];

let YorumlarC = 0;
let ToplamYorumCtrl = 0;
let ToplamYorumlar = [];

let SaleProducts = [];
let WebPages = "";
let Headings = ""

let reviewsPage = 1;
let pageNo = 1;



const iframe = document.querySelector('iframe');

if (document.body.innerText.includes("429 Too Many Requests") || iframe) {
	console.log(`sayfa 429 Saat: ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
	setTimeout(() => {
		location.reload();
	}, 180000); 
} else if (url === 'https://www.etsy.com/yeni' || document.body.innerText.includes("Uh oh!") || document.body.innerText.includes("is currently not selling on Etsy") || document.body.innerText.includes("is taking a short break")) {
    console.log('AdresAl');
	ShopName = "0";
	postData();
} else if (url.endsWith("/sold") || url.includes("/sold?")) {
	console.log('sold');

} else if (url.startsWith('https://www.etsy.com/shop/')) {
	console.log('Sale______');
	setTimeout(Sale1, 1000);
}


function postData() {
	const dataG = Object.fromEntries(
		Object.entries({
			ShopName,
			ShopId,
			StarSeller,
			UrunlerC,
			Fav,
			StoreText,
			SalesCount,
			SoldButtonVar,
			SinceDate,
			LastUpDate,
			WebPages,
			YorumlarC,
			userName,
			userProfileLink,
			DownloadType,
			Headings,
			Urunler: SaleProducts.length > 0 ? SaleProducts : undefined, // Boşsa eklenmez
			Yorumlar: ToplamYorumlar.length > 0 ? ToplamYorumlar : undefined // Boşsa eklenmez
		}).filter(([_, v]) => v !== null && v !== '' && v !== 0 && v !== undefined) // undefined olanları da filtrele
	);
	
    fetch(`http://127.0.0.1:5000/EtsyLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataG)
    })
    .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
    .then(data => {
        console.log("dataGelen", data);
        if (data.UrlName) {
            console.log("data.UrlName", data.UrlName);
            window.location.href = `https://www.etsy.com/shop/${data.UrlName}`;
        } else if (data.status === "Sale2") {
            Sale2();
        } else if (data.status === "YorumAl") {
            YorumAl();
        }
    })
    .catch(error => console.error('Error:', error));
}
	
function Sale1() {
	console.log("Sale1");
    ShopName = window.location.href.replace('https://www.etsy.com/shop/', '').split(/[?\/]/)[0];
    ShopId = parseInt(document.querySelector('[data-shop-id]')?.getAttribute('data-shop-id') || 0, 10);
    StarSeller = document.querySelector('.wt-text-caption-title.wt-ml-xs-1') ? 1 : 0;

    const AllPrE = document.querySelector('.wt-tab__item.is-selected span.wt-mr-md-2');
    UrunlerC = AllPrE ? parseInt(AllPrE.textContent) : 0;


	Headings = Array.from(document.querySelectorAll('.wt-tab__item')).map(item => {
		const titleElement = item.querySelector('.wt-break-word');
		const countElement = item.querySelector('.wt-mr-md-2');

		if (titleElement && countElement) {
			return `${titleElement.innerText.trim()}:${countElement.innerText.trim()}`;
		}
		return null;
	}).filter(Boolean).join(',');


    const FavE = document.querySelector('a[href*="/favoriters"]');
    Fav = FavE ? parseInt(FavE.textContent) : 0;

    const StoreTextE = document.querySelector('h2[data-key="headline"]');
    StoreText = StoreTextE ? StoreTextE.textContent.trim() : '';

    const SalesCountE = document.querySelector('span.wt-text-caption.wt-no-wrap');
    SalesCount = SalesCountE ? parseInt(SalesCountE.textContent.replace(/[^\d]/g, '')) : 0;

    const SoldButton = document.querySelector('span.wt-text-caption.wt-no-wrap a');
    SoldButtonVar = SoldButton ? 1 : 0;

    const EtsySinceElement = document.querySelectorAll('.wt-display-flex-xs .wt-text-title-larger')[1];
    SinceDate = EtsySinceElement ? parseInt(EtsySinceElement.textContent.trim()) : 0;

    LastUpDate = document.querySelector('.wt-text-gray .wt-no-wrap')?.textContent.trim() || 0;	
	
	userName = document.querySelector('.img-container a')?.getAttribute('title') || '';

	userProfileLink = document.querySelector('.img-container a')?.getAttribute('href') || '';
	userProfileLink = userProfileLink.match(/people\/([^/?]+)/)?.[1] || '';

	const containerLinks = document.querySelector('.wt-mb-xs-6 .wt-pt-xs-2 .wt-display-flex-md');

	if (containerLinks) {
		const links = containerLinks.querySelectorAll('a');
		WebPages = Array.from(links).map(link => link.href);
	}

	// Convert content to string if it's not already
	const htmlContent = document.body.innerHTML.toString();

	// Define the patterns to search for
	const patterns = {
		instantDownloads: /instant\s+downloads/i,
		madeToOrderDownloads: /made-to-order\s+downloads/i,
		digitalDownloads: /digital\s+downloads/i
	};

	// Check for each pattern and store results
	const results = {
		d1: patterns.instantDownloads.test(htmlContent),
		d2: patterns.madeToOrderDownloads.test(htmlContent),
		d3: patterns.digitalDownloads.test(htmlContent)
	};
	
	let Download = [];
	if (results.d1) Download.push('1');
	if (results.d2) Download.push('2');
	if (results.d3) Download.push('3');

	//const ShopNameD = sessionStorage.getItem(ShopName) || '2';
	const ShopNameD = '2';
	YorumlarC = parseInt(document.querySelector('.reviews-total .wt-display-inline-block.wt-vertical-align-middle:last-child')?.textContent.match(/\d+/)?.[0]) || 0;
	console.log("YorumlarC", YorumlarC);	
	DownloadType = Download.join('');
	
	if (ShopId === 0) {
		console.log("ShopId hata");
		setTimeout(Sale1, 1000);		
	} else {
		postData();	
	}
}



function waitForPageLoad(expectedPageNo) {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            const currentPageNo = parseInt(window.location.href.match(/page=(\d+)/)?.[1] || 0, 10);
            if (currentPageNo === expectedPageNo) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

async function Sale2() {
    while (true) {
        let PL = 0;
		
        // Ürün verilerini çek
        const newProducts = Array.from(document.querySelectorAll('.listing-link')).map(card => {
            const id = parseInt(card.getAttribute('data-listing-id') || 0, 10);
            const bst = card.querySelector('.wt-badge--statusRecommendation') ? 1 : 0;
            const bas = parseInt(card.querySelector('.wt-text-brick')?.textContent.match(/\d+/)?.[0] || 0, 10);
            const prc = parseFloat(card.querySelector('.n-listing-card__price .currency-value')?.textContent.trim() || 0);
            const tit = card.querySelector('.v2-listing-card__title')?.textContent.trim() || "";
            const pic = card.querySelector('img[alt]')?.getAttribute('srcset')?.split(', ').pop().split(' ')[0].split('/r/il/')[1] || "";

            let product = { id, prc, tit, pic };

            // Geçersiz değerleri sil
            Object.keys(product).forEach(key => {
                if (product[key] === 0 || product[key] === "") {
                    delete product[key];
                }
            });

            const existingProductIndex = SaleProducts.findIndex(existingProduct => existingProduct.id === id);

            if (product.id && product.prc && product.tit) {
                if (existingProductIndex === -1) {
                    PL = 1;
                    SaleProducts.push(product);
                } else {
                    SaleProducts[existingProductIndex] = { ...SaleProducts[existingProductIndex], ...product };
                }
            } else {
                PL = 1;
            }
        });

        // Sonraki sayfaya geç
        const nextPageButton = Array.from(document.querySelectorAll('a, button')).find(el => {
            const href = el.href || "";
            return new RegExp(`page=${pageNo + 1}`).test(href) && href.includes("/shop/") && !href.includes("/reviews?");
        });

        if (PL === 1) {
            // Yeni ürün eklendiğinde devam et
        } else if (nextPageButton) {
            nextPageButton.click();
            console.log("pageNo", pageNo,"__",Math.ceil(UrunlerC / 46));
            pageNo++;
            await waitForPageLoad(pageNo);
        } else {
            console.log("break");
            postData();
            break;
        }
    }
}

function waitForContentChange() {
    return new Promise((resolve) => {
        const bodyNode = document.body; // Sayfanın tamamını izleyeceğiz
        if (!bodyNode) {
            console.error("Sayfa içeriği bulunamadı.");
            resolve();
            return;
        }
        const observer = new MutationObserver((mutationsList) => {
            if (mutationsList.length > 0) {
                observer.disconnect();
                resolve();
            }
        });
        observer.observe(bodyNode, { childList: true, subtree: true });
    });
}

async function YorumAl() {
    while (true) {
		const reviewsPageLink1 = document.querySelector(`a[href*="reviews?ref=pagination&page=${reviewsPage + 1}"]`);
		
		let reviews = [];
		document.querySelectorAll('li[data-region="review"]').forEach((item) => {
		  const extractIdFromUrl = (url, prefix) => url?.match(new RegExp(`${prefix}/([^/?]+)`))?.[1] || null;
		  const formatDate = (dateString) => {
			const date = new Date(dateString);
			return isNaN(date) ? null : date.toISOString().split('T')[0];
		  };

		  // Review nesnesini oluştur
		  const review = {
			id: parseInt(item.getAttribute('data-review-region') || 0, 10),
			nam: item.querySelector('.shop2-review-attribution a')?.innerText || "",
			nid: extractIdFromUrl(item.querySelector('.shop2-review-attribution a')?.getAttribute('href'), '/people'),
			dat: formatDate(item.querySelector('.shop2-review-attribution')?.innerText.split('on ')[1]),
			rat: parseInt(item.querySelector('.stars-svg input[name="initial-rating"]')?.value || 0, 10),
			yor: item.querySelector('.prose')?.innerText || "",
			pid: parseInt(extractIdFromUrl(item.querySelector('[data-region="listing"] a')?.getAttribute('href'), '/listing'), 10) || 0,
			prt: item.querySelector('[data-region="listing"] a p')?.innerText || "",
			img: item.querySelector('.appreciation-photo__container img')?.getAttribute('src') || "", 
		  };

		  // Nesnedeki gereksiz değerleri filtrele
		  Object.keys(review).forEach((key) => {
			if (review[key] === 0 || review[key] === "") {
			  delete review[key];
			}
		  });

		  // Yanıt (response) bilgisi varsa ekle
		  const responseContainer = item.querySelector('[data-region="response"]');
		  if (responseContainer) {
			const responseText = responseContainer.querySelector('.review-text p')?.innerText || "";
			if (responseText) {
			  review.res = {
				nam: responseContainer.querySelector('.flag-body a')?.innerText || "",
				nid: extractIdFromUrl(responseContainer.querySelector('.flag-body a')?.getAttribute('href'), '/people'),
				dat: formatDate(responseContainer.querySelector('.flag-body p')?.innerText.split('on ')[1]),
				yor: responseText,
			  };

			  // Yanıt içindeki gereksiz değerleri kaldır
			  Object.keys(review.res).forEach((key) => {
				if (review.res[key] === 0 || review.res[key] === "") {
				  delete review.res[key];
				}
			  });
			}
		  }

		  reviews.push(review);
		});


		  reviews.forEach((review) => {
			if (!ToplamYorumlar.some((existingProduct) => existingProduct.id === review.id && existingProduct.nam === review.nam && existingProduct.nid === review.nid)) {
			  ToplamYorumlar.push(review);  
			}
		  });
		  

        // Eğer ileri sayfaya giden buton varsa tıklanır//reviewsPage < Math.ceil(YorumlarC / 10) &&
        if ( reviewsPageLink1) {
			if (reviewsPage % 20 === 0) {
				console.log("YorumPage",reviewsPage,"__",Math.ceil(YorumlarC / 10));
			}
            reviewsPageLink1.click();
            reviewsPage++;
        } else if (reviewsPage === Math.ceil(YorumlarC / 10)) {
			postData();
            console.log("yorum Son sayfaya ulaşıldı.",ToplamYorumlar.length);
            break;  // Son sayfaya gelindiği için döngü sonlanır
        }
		await waitForContentChange();
    }
}