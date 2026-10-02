import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    db,
    auth
} from "./firebase.js";


/* =====================================
   ADMIN SETTINGS
===================================== */

const ADMIN_EMAIL = "kahaffashion657@gmail.com";


/* =====================================
   ELEMENTS
===================================== */

const loginSection =
    document.getElementById("loginSection");

const adminPanel =
    document.getElementById("adminPanel");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const logoutButton =
    document.getElementById("logoutButton");

const loginError =
    document.getElementById("loginError");

const productForm =
    document.getElementById("productForm");

const productList =
    document.getElementById("productList");

const imageLinksInput =
    document.getElementById("imageLinks");

const imagePreview =
    document.getElementById("imagePreview");


/* =====================================
   EDIT MODE
===================================== */

let editingProductId = null;


/* =====================================
   IMAGE URL CONVERTER
===================================== */

/*
   Supported:

   ✅ Direct JPG / PNG / WEBP
   ✅ Pexels direct image
   ✅ Unsplash direct image
   ✅ Google Drive share link
   ✅ Google Drive thumbnail link

   Not supported as direct image:

   ❌ Google Photos share link
   ❌ Google Photos webpage link
   ❌ Facebook / Instagram CDN
*/


function convertImageLink(link) {

    link = link.trim();

    if (!link) {
        return "";
    }


    /* =================================
       GOOGLE PHOTOS SHARE LINKS
    ================================= */

    if (
        link.includes("photos.app.goo.gl") ||
        link.includes("photos.google.com")
    ) {

        return "";
    }


    /* =================================
       FACEBOOK / INSTAGRAM CDN
    ================================= */

    if (
        link.includes("fbcdn.net") ||
        link.includes("facebook.com") ||
        link.includes("instagram.com")
    ) {

        return "";
    }


    /* =================================
       GOOGLE DRIVE FILE LINK
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
            encodeURIComponent(fileId) +
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
            encodeURIComponent(fileId) +
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
       
       Only allow lh3.googleusercontent.
       Do NOT allow photos.fife.usercontent.
    ================================= */

    if (
        link.includes(
            "lh3.googleusercontent.com"
        )
    ) {

        return link;
    }


    /* =================================
       NORMAL DIRECT IMAGE URL
    ================================= */

    return link;
}


/* =====================================
   GET IMAGE LINKS FROM TEXTAREA
===================================== */

function getImageLinks() {

    if (!imageLinksInput) {
        return [];
    }


    const rawLinks =
        imageLinksInput.value
            .split("\n")
            .map(link => link.trim())
            .filter(link => link !== "");


    const convertedLinks =
        rawLinks
            .map(link => convertImageLink(link))
            .filter(link => link !== "");


    return convertedLinks;
}


/* =====================================
   IMAGE PREVIEW
===================================== */

function showImagePreview(value) {

    if (!imagePreview) {
        return;
    }


    imagePreview.innerHTML = "";


    const links =
        value
            .split("\n")
            .map(link => link.trim())
            .filter(link => link !== "");


    if (links.length === 0) {
        return;
    }


    links.forEach(
        function (originalLink) {

            const imageURL =
                convertImageLink(
                    originalLink
                );


            const wrapper =
                document.createElement("div");


            wrapper.style.display =
                "inline-flex";

            wrapper.style.flexDirection =
                "column";

            wrapper.style.alignItems =
                "center";

            wrapper.style.margin =
                "5px";


            const img =
                document.createElement("img");


            const status =
                document.createElement("span");


            /* =================================
               INVALID / UNSUPPORTED LINK
            ================================= */

            if (!imageURL) {

                status.textContent =
                    "✕ Unsupported";

                status.style.color =
                    "red";

                status.style.fontSize =
                    "12px";

                wrapper.appendChild(status);

                imagePreview.appendChild(
                    wrapper
                );

                return;
            }


            /* =================================
               IMAGE
            ================================= */

            img.src =
                imageURL;

            img.alt =
                "Product image";

            img.loading =
                "lazy";

            img.referrerPolicy =
                "no-referrer";


            img.style.width =
                "100px";

            img.style.height =
                "100px";

            img.style.objectFit =
                "cover";

            img.style.borderRadius =
                "8px";

            img.style.border =
                "1px solid #ddd";


            /* =================================
               LOADING
            ================================= */

            status.textContent =
                "Loading...";

            status.style.fontSize =
                "12px";


            /* =================================
               SUCCESS
            ================================= */

            img.onload =
                function () {

                    status.textContent =
                        "✓ Working";

                    status.style.color =
                        "green";
                };


            /* =================================
               FAILED
            ================================= */

            img.onerror =
                function () {

                    status.textContent =
                        "✕ Failed";

                    status.style.color =
                        "red";

                    console.warn(
                        "Image could not load:",
                        imageURL
                    );
                };


            wrapper.appendChild(img);

            wrapper.appendChild(status);


            imagePreview.appendChild(
                wrapper
            );

        }
    );

}


/* =====================================
   IMAGE INPUT LISTENER
===================================== */

if (imageLinksInput) {

    imageLinksInput.addEventListener(
        "input",
        function () {

            showImagePreview(
                imageLinksInput.value
            );

        }
    );

}


/* =====================================
   LOGIN
===================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (loginError) {
                loginError.textContent = "";
            }


            const email =
                emailInput.value
                    .trim();


            const password =
                passwordInput.value;


            if (!email || !password) {

                loginError.textContent =
                    "Please enter email and password.";

                return;
            }


            loginButton.disabled =
                true;

            loginButton.textContent =
                "Logging in...";


            try {

                const userCredential =
                    await signInWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );


                const loggedInEmail =
                    (
                        userCredential.user.email ||
                        ""
                    )
                        .trim()
                        .toLowerCase();


                if (
                    loggedInEmail !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    loginError.textContent =
                        "This account is not authorized as admin.";

                    await signOut(auth);

                    return;
                }


                loginError.textContent =
                    "";


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    loginError.textContent =
                        "Incorrect email or password.";

                } else {

                    loginError.textContent =
                        error.message;

                }

            } finally {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "Login";

            }

        }
    );

}


/* =====================================
   AUTH STATE
===================================== */

onAuthStateChanged(
    auth,
    async function (user) {

        if (!user) {

            console.log(
                "❌ No user logged in"
            );


            if (loginSection) {
                loginSection.style.display =
                    "block";
            }


            if (adminPanel) {
                adminPanel.style.display =
                    "none";
            }


            return;
        }


        const loggedInEmail =
            (
                user.email ||
                ""
            )
                .trim()
                .toLowerCase();


        const adminEmail =
            ADMIN_EMAIL
                .trim()
                .toLowerCase();


        console.log(
            "Firebase user logged in"
        );

        console.log(
            "Firebase Email:",
            user.email
        );


        if (
            loggedInEmail ===
            adminEmail
        ) {

            console.log(
                "✅ ADMIN VERIFIED"
            );


            if (loginSection) {
                loginSection.style.display =
                    "none";
            }


            if (adminPanel) {
                adminPanel.style.display =
                    "block";
            }


            if (loginError) {
                loginError.textContent =
                    "";
            }


            await loadAdminProducts();


        } else {

            console.log(
                "❌ ADMIN NOT VERIFIED"
            );


            if (loginSection) {
                loginSection.style.display =
                    "block";
            }


            if (adminPanel) {
                adminPanel.style.display =
                    "none";
            }


            if (loginError) {

                loginError.textContent =
                    "This account is not authorized as admin.";

            }


            await signOut(auth);

        }

    }
);


/* =====================================
   LOGOUT
===================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await signOut(auth);

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* =====================================
   ADD / UPDATE PRODUCT
===================================== */

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const submitButton =
                productForm.querySelector(
                    'button[type="submit"]'
                );


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const price =
                document
                    .getElementById("price")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("category")
                    .value
                    .trim();


            const code =
                document
                    .getElementById("code")
                    .value
                    .trim();


            const description =
                document
                    .getElementById("description")
                    .value
                    .trim();


            const stock =
                document
                    .getElementById("stock")
                    .value
                    .trim();


            const imageLinks =
                getImageLinks();


            /* =================================
               VALIDATION
            ================================= */

            if (!name || !price) {

                alert(
                    "Please enter product name and price."
                );

                return;
            }


            if (
                imageLinks.length === 0
            ) {

                alert(
                    "Please enter at least one valid image link."
                );

                return;
            }


            submitButton.disabled =
                true;


            try {

                /* =================================
                   UPDATE
                ================================= */

                if (editingProductId) {

                    submitButton.textContent =
                        "Updating...";


                    const productRef =
                        doc(
                            db,
                            "products",
                            editingProductId
                        );


                    await updateDoc(
                        productRef,
                        {

                            name: name,

                            price:
                                Number(price),

                            category:
                                category,

                            code:
                                code,

                            description:
                                description,

                            stock:
                                Number(
                                    stock || 0
                                ),

                            images:
                                imageLinks,

                            updatedAt:
                                serverTimestamp()

                        }
                    );


                    alert(
                        "Product updated successfully! ✅"
                    );


                    editingProductId =
                        null;


                    productForm.reset();


                    if (imagePreview) {
                        imagePreview.innerHTML =
                            "";
                    }


                    await loadAdminProducts();


                } else {

                    /* =================================
                       ADD
                    ================================= */

                    submitButton.textContent =
                        "Saving...";


                    await addDoc(
                        collection(
                            db,
                            "products"
                        ),
                        {

                            name: name,

                            price:
                                Number(price),

                            category:
                                category,

                            code:
                                code,

                            description:
                                description,

                            stock:
                                Number(
                                    stock || 0
                                ),

                            images:
                                imageLinks,

                            createdAt:
                                serverTimestamp()

                        }
                    );


                    alert(
                        "Product added successfully! 🎉"
                    );


                    productForm.reset();


                    if (imagePreview) {
                        imagePreview.innerHTML =
                            "";
                    }


                    await loadAdminProducts();

                }


            } catch (error) {

                console.error(
                    "Product error:",
                    error
                );


                alert(
                    "Something went wrong:\n\n" +
                    error.message
                );

            } finally {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    editingProductId
                        ? "Update Product"
                        : "Add Product";

            }

        }
    );

}


/* =====================================
   LOAD ADMIN PRODUCTS
===================================== */

async function loadAdminProducts() {

    if (!productList) {
        return;
    }


    productList.innerHTML =
        "<p>Loading products...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );


        productList.innerHTML =
            "";


        if (snapshot.empty) {

            productList.innerHTML =
                "<p>No products found.</p>";

            return;
        }


        snapshot.forEach(
            function (productDocument) {

                const product =
                    productDocument.data();


                const productId =
                    productDocument.id;


                const images =
                    Array.isArray(
                        product.images
                    )
                        ? product.images
                        : (
                            product.image
                                ? [product.image]
                                : []
                        );


                const firstImage =
                    images.length > 0
                        ? images[0]
                        : "";


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "admin-product";


                const imageHTML =
                    firstImage
                        ? `
                            <img
                                src="${escapeHTML(firstImage)}"
                                alt="${escapeHTML(
                                    product.name ||
                                    "Product"
                                )}"
                                loading="lazy"
                                referrerpolicy="no-referrer"
                            >
                          `
                        : `
                            <div>
                                No Image
                            </div>
                          `;


                item.innerHTML = `

                    <div class="admin-product-image">

                        ${imageHTML}

                    </div>


                    <div class="admin-product-info">

                        <h3>
                            ${escapeHTML(
                                product.name ||
                                "Unnamed Product"
                            )}
                        </h3>


                        <p>
                            Price:
                            ₹${product.price || 0}
                        </p>


                        <p>
                            Category:
                            ${escapeHTML(
                                product.category ||
                                "N/A"
                            )}
                        </p>


                        <p>
                            Code:
                            ${escapeHTML(
                                product.code ||
                                "N/A"
                            )}
                        </p>


                        <p>
                            Stock:
                            ${product.stock || 0}
                        </p>


                        <div class="admin-product-actions">

                            <button
                                class="edit-product-btn"
                                data-id="${productId}"
                            >
                                ✏️ Edit
                            </button>


                            <button
                                class="delete-product-btn"
                                data-id="${productId}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                productList.appendChild(
                    item
                );

            }
        );


        /* =================================
           EDIT BUTTONS
        ================================= */

        document
            .querySelectorAll(
                ".edit-product-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            startEditingProduct(
                                this.dataset.id
                            );

                        }
                    );

                }
            );


        /* =================================
           DELETE BUTTONS
        ================================= */

        document
            .querySelectorAll(
                ".delete-product-btn"
            )
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        async function () {

                            const productId =
                                this.dataset.id;


                            const confirmed =
                                confirm(
                                    "Are you sure you want to delete this product?"
                                );


                            if (!confirmed) {
                                return;
                            }


                            await deleteProduct(
                                productId
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            "Error loading products:",
            error
        );


        productList.innerHTML =
            `
                <p>
                    Error loading products:
                    ${escapeHTML(
                        error.message
                    )}
                </p>
            `;

    }

}


/* =====================================
   START EDITING
===================================== */

async function startEditingProduct(
    productId
) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        /*
           IMPORTANT:
           Get only this product.
           No need to download all products.
        */

        const snapshot =
            await getDoc(
                productRef
            );


        if (!snapshot.exists()) {

            alert(
                "Product not found."
            );

            return;
        }


        const selectedProduct =
            snapshot.data();


        editingProductId =
            productId;


        document.getElementById(
            "name"
        ).value =
            selectedProduct.name || "";


        document.getElementById(
            "price"
        ).value =
            selectedProduct.price || "";


        document.getElementById(
            "category"
        ).value =
            selectedProduct.category || "";


        document.getElementById(
            "code"
        ).value =
            selectedProduct.code || "";


        document.getElementById(
            "description"
        ).value =
            selectedProduct.description || "";


        document.getElementById(
            "stock"
        ).value =
            selectedProduct.stock || 0;


        const images =
            Array.isArray(
                selectedProduct.images
            )
                ? selectedProduct.images
                : (
                    selectedProduct.image
                        ? [selectedProduct.image]
                        : []
                );


        if (imageLinksInput) {

            imageLinksInput.value =
                images.join("\n");


            showImagePreview(
                imageLinksInput.value
            );

        }


        const submitButton =
            productForm.querySelector(
                'button[type="submit"]'
            );


        submitButton.textContent =
            "Update Product";


        productForm.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );


        alert(
            "Could not load product for editing."
        );

    }

}


/* =====================================
   DELETE PRODUCT
===================================== */

async function deleteProduct(
    productId
) {

    try {

        const productRef =
            doc(
                db,
                "products",
                productId
            );


        await deleteDoc(
            productRef
        );


        alert(
            "Product deleted successfully! 🗑️"
        );


        await loadAdminProducts();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );


        alert(
            "Could not delete product:\n\n" +
            error.message
        );

    }

}


/* =====================================
   HTML ESCAPE
===================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
