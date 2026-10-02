import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    db
} from "./firebase.js";


/* ==========================================
   GET ALL PRODUCTS
========================================== */

export async function getProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        const products = [];


        snapshot.forEach(
            function (documentSnapshot) {

                products.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        console.log(
            "Products loaded:",
            products
        );


        return products;


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        return [];

    }

}


/* ==========================================
   GET SINGLE PRODUCT
========================================== */

export async function getProduct(
    productId
) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        const snapshot =
            await getDoc(
                productRef
            );


        if (
            snapshot.exists()
        ) {

            return {

                id:
                    snapshot.id,

                ...snapshot.data()

            };

        }


        return null;


    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );


        return null;

    }

}


/* ==========================================
   IMAGE URL
========================================== */

export function convertProductImageURL(
    link
) {

    if (
        typeof link !== "string"
    ) {

        return "";

    }


    link =
        link.trim();


    if (!link) {
        return "";
    }


    /* =================================
       GOOGLE PHOTOS
       
       These are NOT direct image URLs.
    ================================= */

    if (
        link.includes(
            "photos.app.goo.gl"
        ) ||
        link.includes(
            "photos.google.com"
        )
    ) {

        return "";

    }


    /* =================================
       FACEBOOK / INSTAGRAM
    ================================= */

    if (
        link.includes(
            "fbcdn.net"
        ) ||
        link.includes(
            "facebook.com"
        ) ||
        link.includes(
            "instagram.com"
        )
    ) {

        return "";

    }


    /* =================================
       GOOGLE DRIVE
    ================================= */

    const driveFileMatch =
        link.match(
            /drive\.google\.com\/file\/d\/([^/]+)/
        );


    if (driveFileMatch) {

        const fileId =
            driveFileMatch[1];


        return (
            "https://drive.google.com/thumbnail" +
            "?id=" +
            encodeURIComponent(
                fileId
            ) +
            "&sz=w1600"
        );

    }


    /* =================================
       GOOGLE DRIVE OPEN LINK
    ================================= */

    const driveOpenMatch =
        link.match(
            /drive\.google\.com\/open\?id=([^&]+)/
        );


    if (driveOpenMatch) {

        const fileId =
            driveOpenMatch[1];


        return (
            "https://drive.google.com/thumbnail" +
            "?id=" +
            encodeURIComponent(
                fileId
            ) +
            "&sz=w1600"
        );

    }


    /* =================================
       GOOGLE DRIVE THUMBNAIL
    ================================= */

    if (
        link.includes(
            "drive.google.com/thumbnail"
        )
    ) {

        return link;

    }


    /* =================================
       GOOGLE USERCONTENT
       
       Only allow lh3.
    ================================= */

    if (
        link.includes(
            "lh3.googleusercontent.com"
        )
    ) {

        return link;

    }


    /* =================================
       NORMAL IMAGE URL
    ================================= */

    return link;

}


/* ==========================================
   GET PRODUCT IMAGES
========================================== */

export function getProductImages(
    product
) {

    let images = [];


    /* New images array */

    if (
        Array.isArray(
            product.images
        )
    ) {

        images =
            product.images;

    }


    /* Old image field */

    else if (
        typeof product.image ===
        "string"
    ) {

        images = [
            product.image
        ];

    }


    return images

        .filter(
            image =>
                typeof image ===
                "string" &&
                image.trim() !== ""
        )

        .map(
            image =>
                convertProductImageURL(
                    image
                )
        )

        .filter(
            image =>
                image !== ""
        );

}


/* ==========================================
   WHATSAPP
========================================== */

export function createWhatsAppLink(
    product
) {

    const phoneNumber =
        "919867495547";


    const message =
        [
            "Hello Kahaf Fashion,",
            "",
            "I am interested in this product:",
            "",
            `Product: ${product.name || ""}`,
            `Price: ₹${product.price || ""}`,
            `Category: ${product.category || "N/A"}`,
            `Code: ${product.code || "N/A"}`
        ].join("\n");


    return (
        "https://wa.me/" +
        phoneNumber +
        "?text=" +
        encodeURIComponent(
            message
        )
    );

}


/* ==========================================
   DISPLAY PRODUCTS
========================================== */

async function displayProducts() {

    /*
       IMPORTANT:

       If this page does not have
       #productContainer, simply stop.

       No console error.
    */

    const container =
        document.getElementById(
            "productContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        `
            <div class="products-loading">
                Loading products...
            </div>
        `;


    const products =
        await getProducts();


    container.innerHTML =
        "";


    if (
        products.length === 0
    ) {

        container.innerHTML =
            `
                <p>
                    No products available yet.
                </p>
            `;

        return;

    }


    products.forEach(
        function (product) {

            const images =
                getProductImages(
                    product
                );


            const firstImage =
                images.length > 0
                    ? images[0]
                    : "";


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "product-card";


            /* =================================
               IMAGE
            ================================= */

            let imageHTML;


            if (firstImage) {

                imageHTML =
                    `
                        <img
                            src="${escapeHTML(firstImage)}"
                            alt="${escapeHTML(
                                product.name ||
                                "Kahaf Fashion Product"
                            )}"
                            loading="lazy"
                            class="product-img"
                            referrerpolicy="no-referrer"
                        >
                    `;

            } else {

                imageHTML =
                    `
                        <div class="no-image">
                            IMAGE NOT AVAILABLE
                        </div>
                    `;

            }


            /* =================================
               CARD
            ================================= */

            card.innerHTML =
                `

                    <a
                        href="product.html?id=${encodeURIComponent(
                            product.id
                        )}"
                        class="product-link"
                    >

                        <div class="product-image">

                            ${imageHTML}

                        </div>

                    </a>


                    <div class="product-info">

                        <h3>
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>


                        <p>
                            ₹${product.price || 0}
                        </p>


                        <a
                            class="whatsapp-btn"
                            href="${createWhatsAppLink(
                                product
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Order on WhatsApp
                        </a>

                    </div>

                `;


            container.appendChild(
                card
            );


            /* =================================
               IMAGE ERROR HANDLING
            ================================= */

            const productImage =
                card.querySelector(
                    ".product-img"
                );


            if (productImage) {

                productImage.addEventListener(
                    "error",
                    function () {

                        console.warn(
                            "Product image failed:",
                            firstImage
                        );


                        this.style.display =
                            "none";


                        const noImage =
                            document.createElement(
                                "div"
                            );


                        noImage.className =
                            "no-image";


                        noImage.textContent =
                            "IMAGE NOT AVAILABLE";


                        this
                            .parentElement
                            .appendChild(
                                noImage
                            );

                    }
                );

            }

        }
    );

}


/* ==========================================
   HTML ESCAPE
========================================== */

function escapeHTML(
    value
) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* ==========================================
   START
========================================== */

/*
   Run only when the page actually contains
   #productContainer.
*/

if (
    document.getElementById(
        "productContainer"
    )
) {

    displayProducts();

}
