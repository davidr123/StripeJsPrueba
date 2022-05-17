import STRIPE_KEYS from '../assets/stripe.key.js';
console.log(STRIPE_KEYS);



const d = document,
$id_tacos= d.getElementById('tacos'),
$template_tacos= d.getElementById('taco-template').content,
$fragment= d.createDocumentFragment();
const SECRET_KEY={
    headers:{
        Authorization:`Bearer ${STRIPE_KEYS.secret}`
    }
}

let products, prices;

const numeroConvertido= num => `${num.slice(0,-2)}.${num.slice(-2)}`

const _serviceStripe= async()=>{

    try {
        Promise.all([
            await fetch('https://api.stripe.com/v1/products', SECRET_KEY),
            await fetch('https://api.stripe.com/v1/prices', SECRET_KEY)
        ]).then((responses)=> Promise.all(responses.map((res)=>  res.json())))
        .then(json=> {
            products= json[0].data;
            prices= json[1].data;
            console.log(products, prices);

            prices.forEach((el)=> {
                let productosData = products.filter(prod=> prod.id === el.product);
                console.log(productosData);
    
                 $template_tacos.querySelector(".taco").setAttribute("data-price", el.id);
                 $template_tacos.querySelector('img').src= productosData[0].images[0];
                 $template_tacos.querySelector('img').alt= productosData[0].name;
                 $template_tacos.querySelector('figcaption').innerHTML= `
                 ${productosData[0].name}
                 <br>
                 <b>$${numeroConvertido(el.unit_amount_decimal)} ${el.currency}</b>
                 `


                let clone = d.importNode($template_tacos, true);
                $fragment.appendChild(clone);
    
    
            });
            $id_tacos.appendChild($fragment);
        });

 


      

    
    } catch (error) {
        // console.log(error);
        let message = error.statusText || 'Ocurrio un error';
        console.log(`${error.statusText}: ${message}`)
        $id_tacos.innerHTML= `<p><b>Error ${error.status}: ${message}</b></p>`
    }

    d.addEventListener('click', e=>{
        if(e.target.matches('.taco *')){
            let price= e.target.parentElement.getAttribute('data-price');
         
            Stripe(STRIPE_KEYS.public).redirectToCheckout({
                lineItems:[{price, quantity:1}],
                mode:'subscription',
                successUrl:'http://127.0.0.1:5500/assets/stripe-success.html',
                cancelUrl:'http://127.0.0.1:5500/assets/stripe-cancel.html'
            })
            .then(res=>{
                if(res.error){
                    $id_tacos.insertAdjacentHTML('afterend', res.error.message)
                }
            })
        }
       
    })


    

    // let resp = await fetch('https://api.stripe.com/v1/products', SECRET_KEY),
    // json = await resp.json();
    // console.log(json);



}
_serviceStripe();



// const SECRET_KEY={
//     headers:{
//         Authorization:`Bearer ${STRIPE_KEYS.secret}`
//     }
// }

// fetch('https://api.stripe.com/v1/products', SECRET_KEY)
// .then(resp=>{
//     return resp.json();
// }).then(json=>{
//      console.log(json);
// })