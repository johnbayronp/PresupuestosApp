// Funciones cerradas , No tienen acceso desde afuera - Modulos

// PRESUPUESTO CONTROLLER
var presupuestosController = (function () {   

    var gastos = function(id,descripcion,valor){
        this.id = id;
        this.descripcion = descripcion;
        this.valor = valor;
        this.porcentaje = -1;
    };

    gastos.prototype.calcPercentage = function (totalInc) {  
        if(totalInc>0){
            this.porcentaje = Math.round((this.valor / totalInc) * 100);
        }else{
            this.porcentaje = -1;
        }

    };

    gastos.prototype.getPercentage = function(){
        return this.porcentaje;
    };
    
    var ingresos = function(id,descripcion,valor){
        this.id = id;
        this.descripcion = descripcion;
        this.valor = valor;
    };

    var calculoTotal = function (type) {
        var suma = 0;
        datos.todosItems[type].forEach(function (current) { 
            suma += current.valor;
        });
        datos.totales[type] = suma;
          
    };  

    var datos = {
        todosItems: {
            exp:[],
            inc:[]
        },
        totales: {
            exp:0,
            inc:0  
        },
        presupuesto: 0,
        porcentaje: 0
    };

    return {
        addItem: function (type,des,val) {
            var ID;

            // Crear un nuevo ID
            if(datos.todosItems[type].length > 0){
                ID = datos.todosItems[type][datos.todosItems[type].length - 1].id + 1 ; 
            }else{
                ID = 0;
            }

            // Crear un nuevo item basado en inc(ingreso) o exp(gasto)
            if(type === 'exp'){
                var newItem = new gastos(ID,des,val);
            }else if( type === 'inc'){
                var newItem = new ingresos (ID,des,val);
            }

            // Empujarlo a la estructura de datos 
            datos.todosItems[type].push(newItem);
            
            // Retorna el nuevo elemento
            return newItem;
            
        },

        deleteItem: function(type, id){

            // id = 6
            //data.todosItems[type][id]
            // ids = [1 2 4 8] 
            // index  = 3 

            ids = datos.todosItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                datos.todosItems[type].splice(index,1);
            }
        },

        calcularPresupuesto: function() {

            //1. Calculamos Total de ingresos y gastos 
            calculoTotal('exp');
            calculoTotal('inc');
            //2. Calculamos el presupuesto: Ingresos - gastos
          
            datos.presupuesto = datos.totales.inc - datos.totales.exp;
           
            //3. Calculamos el porcentaje de ingreso 
            if(datos.totales.inc>0){
                datos.porcentaje = Math.round((datos.totales.exp / datos.totales.inc)*100);
            }else{
                datos.porcentaje = -1;
            }
            

            // Expense = 100 and income 200 , spent 33.33%  = 100/300 = 0.333 * 100

        },

        calcularPorcentajes: function(){

            /*a= 20 , b= 10 , c=40 
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40 / 100 = 40%
            */
            
            datos.todosItems.exp.forEach(function (cur) {
                cur.calcPercentage(datos.totales.inc);
            });
        },

        getPercentage: function(){
            var allPerc= datos.todosItems.exp.map(function (cur) {
                return cur.getPercentage();
              });
            return allPerc;
        },


        obtenerPresupuesto: function () {
            return {
                presupuesto: datos.presupuesto,
                totalInc: datos.totales.inc,
                totalExp: datos.totales.exp,
                porcentaje: datos.porcentaje
            }
        },

        testing: function(){
            console.log(datos.todosItems);
        }
        
    };


})();





// UI CONTROLLER
var UIcontroller= (function () { 
 
    // Generalizamos todas las clases para automatizar si hay algun cambio en la clase.
    var DOMstring = {
        inputType: '.add__type', 
        inputDescripcion: '.add__description',
        inputValue: '.add__value',
        buttonClickAdd: '.add__btn',
        ingresoContainer:'.income__list',
        gastosContainer: '.expenses__list',
        presupuestoDisplay: '.budget__value',
        incDisplay: '.budget__income--value',
        expDisplay: '.budget__expenses--value',
        porcDisplay: '.budget__expenses--percentage',
        porAdd:'.item__percentage',
        container: '.container',
        dateLabel: '.budget__title--month'
    };

    var formatNumeros = function(num,type){
        var numSplit,int,dec;
        // Separar los numeros en comas y puntos 
        /* 2310.45 -> 2,310.45*/
       num = Math.abs(num);
       num = num.toFixed(2);
       numSplit = num.split('.');
       
       int = numSplit[0];
       if (int.length>3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length -3 , 3);
       }
        
       dec = numSplit[1];

       return (type === 'exp' ? sign = '-' : sign = '+')+ ' ' + int +'.'+ dec;

    };

    var nodelistForEach = function(list,callback){
        for(var i = 0; i <list.length; i++){
            callback(list[i],i);
        }
    };


    //PUBLIC
    return {
        obtenerInput: function(){
            return {
                type: document.querySelector(DOMstring.inputType).value, //inc (ingresos) o exp (gastos)
                descripcion: document.querySelector(DOMstring.inputDescripcion).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }            
        },

        addListItem: function(obj,type){

            var html,newHtml;

            // crear HTML con placeholder text 
            if(type === 'inc'){
                element= DOMstring.ingresoContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }else if(type === 'exp'){
                
                element= DOMstring.gastosContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%descripcion%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
           
            //  Remplazar el placeholder con el dato actual que sacamos de objeto ingresado
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%descripcion%', obj.descripcion);
            newHtml = newHtml.replace('%value%', formatNumeros(obj.valor,type));
           

            // insertar el html en el DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
            
        },

        deleteListItem:function(selectorID){

           var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields:function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstring.inputDescripcion + ', ' + DOMstring.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });

            fieldsArr[0].focus();
        },
        

        displayPresupuesto: function(obj){

            obj.presupuesto > 0 ? type = 'inc' : type = 'exp';
             
            document.querySelector(DOMstring.presupuestoDisplay).textContent = formatNumeros(obj.presupuesto,type);
            document.querySelector(DOMstring.incDisplay).textContent = formatNumeros(obj.totalInc,'inc');
            document.querySelector(DOMstring.expDisplay).textContent = formatNumeros(obj.totalExp,'exp');

            if(obj.porcentaje>0 ){
                document.querySelector(DOMstring.porcDisplay).textContent = obj.porcentaje+'%';
                document.querySelector(DOMstring.porAdd).textContent = obj.porcentaje+'%';
            }else{
                document.querySelector(DOMstring.porcDisplay).textContent = '---';
            }         
        },

        displayPorcentajes: function(porcentajes){

            var fields= document.querySelectorAll(DOMstring.porAdd);
          
            nodelistForEach(fields,function (current,index) {
                //Do stuff
                if(porcentajes[index]>0){
                current.textContent = porcentajes[index] + ' %';
                }else{
                current.textContent = '---';
                }
            });

        },

        displayMes: function () {  
            var ahora,año,getMes,meses;

            meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            ahora = new Date();
            getMes = meses[ahora.getMonth()-1];
            
            año = ahora.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent = getMes +' del '+año;
        },
       
        changeType: function(){

            var fields = document.querySelectorAll(
                DOMstring.inputType+','+
                DOMstring.inputDescripcion+ ','+
                DOMstring.inputValue
            );

            nodelistForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.buttonClickAdd).classList.toggle('red');
        },

        getDOMstring : function(){
            return DOMstring;
        }
    };


})();





// GLOBAL APP CONTROLLER
var controller = (function(presupCtrl,UICtrl){
    
    var setupEvent = function () {  
        var DOM = UICtrl.getDOMstring();
        
        document.querySelector(DOM.buttonClickAdd).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
                event.keyCode === 13 ? ctrlAddItem() : click = false;
        });

        document.querySelector(DOM.container).addEventListener('click',ctrlDeletItem)
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);
    };

    var updatePercentages =  function () { 

        // 1. Calcular porcentajes 
        presupCtrl.calcularPorcentajes();

        // 2. leer los porcentajes desde el controlador de presupuesto
        var porcentajes = presupCtrl.getPercentage();

        // 3. actualizar las intefaz Usuario con los nuevos porcentajes 
        UICtrl.displayPorcentajes(porcentajes);

    };

    var actualizarPresupuesto = function(){
        
        //1. Calculamos el presupuesto.
        presupCtrl.calcularPresupuesto();

        //2. Retornamos el presupuesto.
        var presupuesto = presupCtrl.obtenerPresupuesto();
        
        //3. Mostramos el presupuesto en User Interface.
        UICtrl.displayPresupuesto(presupuesto);
    };


    var ctrlAddItem = function(){
        var input,newItem;

        //1. Obtenemos los datos de los input
        input = UICtrl.obtenerInput();

        if(input.descripcion !== "" && !isNaN(input.value) && input.value > 0){
            
            //2. Agregamos al item de presupuestos Controller
            newItem = presupCtrl.addItem(input.type, input.descripcion, input.value);

            //3. Agregamos el item a el UI controller
            UICtrl.addListItem(newItem,input.type);

            //4. Limpiamos los campos 
            UICtrl.clearFields();

            //5. Calculamos y actualizamos presupuestos 
            actualizarPresupuesto();

            //6. calcular porcentajes  
            updatePercentages();
        }
        
    };

    var ctrlDeletItem = function(event){
        var itemID,splitID,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID){

            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Eliminar los ite desde la estrutura de datos 
                presupCtrl.deleteItem(type,ID);

            // 2. Eliminar los item en UI
                UICtrl.deleteListItem(itemID);
            // 3. Actualizar y mostrar los presupuestos nuevos 
                actualizarPresupuesto();
        }

    };

    //PUBLIC
    return{
        init: function(){
            console.log('Aplicacion Iniciada.');
            UICtrl.displayMes();
            UICtrl.displayPresupuesto({
                presupuesto: 0,
                totalInc: 0,
                totalExp: 0,
                porcentaje: -1
            });
            setupEvent();

        }
    };


})(presupuestosController,UIcontroller);



// INICIAR APP
controller.init();