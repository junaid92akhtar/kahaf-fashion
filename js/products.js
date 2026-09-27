import {
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { db } from "./firebase.js";


// ==========================================
// GET ALL PRODUCTS
// ==========================================

export async function getProducts() {

    try {

        const snapshot = await getDocs(
            collection(db, "products")
        );

        const products = [];

        snapshot.forEach((documentSnapshot) => {

            products.push({
                id: documentSnapshot.id,
                ...documentSnapshot.data()
            });

        });

        console.log("Products loaded:", products);

        return products;

    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );

        return [];

    }
}


// ==========================================
// GET SINGLE PRODUCT
// ==========================================

export async function getProduct(productId) {

    try {

        const productRef = doc(
            db,
            "products",
            productId
        );

        const snapshot = await getDoc(productRef);

        if (snapshot.exists()) {

            return {
                id: snapshot.id,
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


// ==========================================
// GET PRODUCT IMAGES
// ==========================================

export function getProductImages(product) {

    if (
        Array.isArray(product.images) &&
        product.images.length > 0
    ) {

        return product.images
            .filter(
                image =>
                    typeof image === "string" &&
                    image.trim() !== ""
            )
            .map(
                image => image.trim()
            );

    }


    // Old image field support

    if (
        typeof product.image === "string" &&
        product.image.trim() !== ""
    ) {

        return [
            product.image.trim()
        ];

    }


    return [];

}


// ==========================================
// WHATSAPP
// ==========================================

export function createWhatsAppLink(product) {

    const phoneNumber =
        "919867495547";


    const message =
        `Hello Kahaf Fashion,%0A%0A` +
        `I am interested in this product:%0A` +
        `Product: ${encodeURIComponent(
            product.name || ""
        )}%0A` +
        `Price: ₹${encodeURIComponent(
            product.price || ""
        )}%0A` +
        `Category: ${encodeURIComponent(
            product.category || "N/A"
        )}%0A` +
        `Code: ${encodeURIComponent(
            product.code || "N/A"
        )}`;


    return (
        "https://wa.me/" +
        phoneNumber +
        "?text=" +
        message
    );

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

async function displayProducts() {

    const container =
        document.getElementById(
            "productContainer"
        );


    if (!container) {

        console.log(
            "productContainer not found."
        );

        return;

    }


    const products =
        await getProducts();


    container.innerHTML = "";


    if (products.length === 0) {

        container.innerHTML =
            "<p>No products available yet.</p>";

        return;

    }


    products.forEach(product => {

        const images =
            getProductImages(product);


        const firstImage =
            images.length > 0
                ? images[0]
                : "";


        const card =
            document.createElement("div");


        card.className =
            "product-card";


        card.innerHTML = `

            <a
                href="product.html?id=${product.id}"
                class="product-link"
            >

                <div class="product-image">

                    ${
                        firstImage

                        ?

                        `
                        <img
                            src="${firstImage}"
                            alt="${product.name || "Kahaf Fashion Product"}"
                            loading="lazy"
                            class="product-img"
                        >
                        `

                        :

                        `
                        <div class="no-image">
                            NO IMAGE
                        </div>
                        `
                    }

                </div>

            </a>


            <div class="product-info">

                <h3>
                    ${product.name || "Unnamed Product"}
                </h3>


                <p>
                    ₹${product.price || 0}
                </p>


                <a
                    class="whatsapp-btn"
                    href="${createWhatsAppLink(product)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Order on WhatsApp
                </a>

            </div>

        `;


        container.appendChild(card);

    });

}


// ==========================================
// START
// ==========================================

displayProducts();