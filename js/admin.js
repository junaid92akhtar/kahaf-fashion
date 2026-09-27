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
IMAGE PREVIEW
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

function showImagePreview(value) {


if (!imagePreview) return;

const links =
    value
        .split("\n")
        .map(link => link.trim())
        .filter(link => link !== "");

imagePreview.innerHTML = "";

links.forEach(link => {

    const img =
        document.createElement("img");

    img.src = link;

    img.style.width = "100px";
    img.style.height = "100px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.margin = "5px";

    img.onerror = function () {
        img.style.opacity = "0.3";
    };

    imagePreview.appendChild(img);

});

}

/* =====================================
LOGIN
===================================== */

if (loginForm) {


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        if (!email || !password) {

            loginError.textContent =
                "Please enter email and password.";

            return;
        }


        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";


        try {

            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


            if (
                userCredential.user.email.toLowerCase()
                !==
                ADMIN_EMAIL.toLowerCase()
            ) {

                loginError.textContent =
                    "This account is not authorized as admin.";

                await signOut(auth);

                return;
            }


            loginError.textContent = "";


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

            loginButton.disabled = false;

            loginButton.textContent =
                "Login";

        }

    }
);


}

/* =====================================
AUTH STATE
===================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        console.log("❌ No user logged in");

        loginSection.style.display = "block";
        adminPanel.style.display = "none";

        return;
    }

    console.log("✅ Firebase user logged in");
    console.log("Firebase UID:", user.uid);
    console.log("Firebase Email:", user.email);
    console.log("Expected Admin:", ADMIN_EMAIL);


    const loggedInEmail =
        (user.email || "").trim().toLowerCase();

    const adminEmail =
        ADMIN_EMAIL.trim().toLowerCase();


    if (loggedInEmail === adminEmail) {

        console.log("✅ ADMIN VERIFIED");

        loginSection.style.display = "none";
        adminPanel.style.display = "block";

        loginError.textContent = "";

        await loadAdminProducts();

    } else {

        console.log("❌ ADMIN NOT VERIFIED");
        console.log(
            "Logged in:",
            JSON.stringify(loggedInEmail)
        );
        console.log(
            "Expected:",
            JSON.stringify(adminEmail)
        );

        loginSection.style.display = "block";
        adminPanel.style.display = "none";

        loginError.textContent =
            "This account is not authorized as admin.";

        await signOut(auth);
    }

});

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
            imageLinksInput
                ? imageLinksInput.value
                    .split("\n")
                    .map(link => link.trim())
                    .filter(link => link !== "")
                : [];


        if (!name || !price) {

            alert(
                "Please enter product name and price."
            );

            return;
        }


        if (imageLinks.length === 0) {

            alert(
                "Please enter at least one image link."
            );

            return;
        }


        submitButton.disabled = true;


        try {

            /* =================================
               UPDATE EXISTING PRODUCT
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

                        price: Number(price),

                        category: category,

                        code: code,

                        description: description,

                        stock: Number(
                            stock || 0
                        ),

                        images: imageLinks,

                        updatedAt:
                            serverTimestamp()
                    }
                );


                alert(
                    "Product updated successfully! ✅"
                );


                editingProductId = null;


                productForm.reset();

                if (imagePreview) {
                    imagePreview.innerHTML = "";
                }


                submitButton.textContent =
                    "Add Product";


                await loadAdminProducts();

                return;
            }


            /* =================================
               ADD NEW PRODUCT
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

                    price: Number(price),

                    category: category,

                    code: code,

                    description: description,

                    stock: Number(
                        stock || 0
                    ),

                    images: imageLinks,

                    createdAt:
                        serverTimestamp()

                }
            );


            alert(
                "Product added successfully! 🎉"
            );


            productForm.reset();

            if (imagePreview) {
                imagePreview.innerHTML = "";
            }


            await loadAdminProducts();


        } catch (error) {

            console.error(
                "Product error:",
                error
            );


            alert(
                "Something went wrong:\n\n"
                +
                error.message
            );

        } finally {

            submitButton.disabled =
                false;


            if (editingProductId) {

                submitButton.textContent =
                    "Update Product";

            } else {

                submitButton.textContent =
                    "Add Product";

            }

        }

    }
);


}

/* =====================================
LOAD PRODUCTS
===================================== */

async function loadAdminProducts() {


if (!productList) return;


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


    productList.innerHTML = "";


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


            const firstImage =
                product.images &&
                product.images.length > 0
                    ? product.images[0]
                    : product.image || "";


            const item =
                document.createElement("div");


            item.className =
                "admin-product";


            item.innerHTML = `

                <div class="admin-product-image">

                    ${
                        firstImage
                        ?
                        `
                        <img
                            src="${firstImage}"
                            alt="${product.name || "Product"}"
                        >
                        `
                        :
                        `
                        <div>
                            No Image
                        </div>
                        `
                    }

                </div>


                <div class="admin-product-info">

                    <h3>
                        ${product.name || "Unnamed Product"}
                    </h3>


                    <p>
                        Price:
                        ₹${product.price || 0}
                    </p>


                    <p>
                        Category:
                        ${product.category || "N/A"}
                    </p>


                    <p>
                        Code:
                        ${product.code || "N/A"}
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


            productList.appendChild(item);

        }
    );


    /* EDIT BUTTONS */

    const editButtons =
        document.querySelectorAll(
            ".edit-product-btn"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        this.dataset.id;

                    startEditingProduct(
                        productId
                    );

                }
            );

        }
    );


    /* DELETE BUTTONS */

    const deleteButtons =
        document.querySelectorAll(
            ".delete-product-btn"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async function () {

                    const productId =
                        this.dataset.id;


                    const confirmDelete =
                        confirm(
                            "Are you sure you want to delete this product?"
                        );


                    if (!confirmDelete) {
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
            ${error.message}
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


    const productSnapshot =
        await getDocs(
            collection(
                db,
                "products"
            )
        );


    let selectedProduct = null;


    productSnapshot.forEach(
        productDocument => {

            if (
                productDocument.id
                ===
                productId
            ) {

                selectedProduct =
                    productDocument.data();

            }

        }
    );


    if (!selectedProduct) {

        alert(
            "Product not found."
        );

        return;
    }


    editingProductId =
        productId;


    /* FILL FORM */

    document.getElementById("name").value =
        selectedProduct.name || "";


    document.getElementById("price").value =
        selectedProduct.price || "";


    document.getElementById("category").value =
        selectedProduct.category || "";


    document.getElementById("code").value =
        selectedProduct.code || "";


    document.getElementById("description").value =
        selectedProduct.description || "";


    document.getElementById("stock").value =
        selectedProduct.stock || 0;


    const images =
        Array.isArray(
            selectedProduct.images
        )
        ?
        selectedProduct.images
        :
        selectedProduct.image
            ? [selectedProduct.image]
            : [];


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


    /* SCROLL TO FORM */

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
        "Could not delete product:\n\n"
        +
        error.message
    );

}


}
