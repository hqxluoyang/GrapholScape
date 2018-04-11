GrapholScape.prototype.createUi = function () {
  // reference to this object, used when adding event listeners
  var this_graph = this;
  var i;

  // module : diagram list
  var module = document.createElement('div');
  var child = document.createElement('div');
  var img = document.createElement('img');
  module.setAttribute('id','diagram_name');
  module.setAttribute('class','module');

  // module head
  child.setAttribute('id','title');
  child.setAttribute('class','module_head');
  child.innerHTML = 'Select a diagram';
  module.appendChild(child);

  // module button
  child = document.createElement('div');
  child.setAttribute('id','diagram-list-button');
  child.setAttribute('class','module_button');
  child.setAttribute('onclick','toggle(this)');
  img.setAttribute('src','icons/drop_down_24dp.png');
  child.appendChild(img);
  module.appendChild(child);

  // module dropdown div
  child = document.createElement('div');
  child.setAttribute('id','diagram_list');
  child.setAttribute('class','hide collapsible');

  // adding diagrams in the dropdown div
  var item;
  for(i=0; i<this.diagrams.length; i++) {
    item = document.createElement('div');
    item.setAttribute('class','diagram_item');

    item.innerHTML = this.diagrams[i].getAttribute('name');

    item.addEventListener('click',function () {
      this_graph.drawDiagram(this.innerHTML);
      toggle(document.getElementById('diagram-list-button'));
    });

    child.appendChild(item);
  }

  module.appendChild(child);
  makeDraggable(module);
  this.container.appendChild(module);

  // module : Explorer
  module= module.cloneNode(true);
  module.setAttribute('id','explorer');
  // module still have class = 'module' so we don't need to addd them
  var input = document.createElement('input');
  input.setAttribute('autocomplete','off');
  input.setAttribute('type','text');
  input.setAttribute('id','search');
  input.setAttribute('placeholder','Search Predicates...');
  input.setAttribute('onkeyup','search(this.value)');

  //module_head contains the input field
  module.firstElementChild.innerHTML='';
  module.firstElementChild.appendChild(input);
  // we need to modify the id of the module_button
  module.getElementsByClassName('module_button')[0].setAttribute('id','predicates-list-button');

  // dropdown div with predicates list
  module.removeChild(module.lastElementChild);
  child = document.createElement('div');
  child.setAttribute('id','predicates_list');
  child.setAttribute('class','hide collapsible');

  module.appendChild(child);
  makeDraggable(module);
  this.container.appendChild(module);

  // Ontology Explorer Table Population
  var j,row, wrap, col, img_type_address, sub_rows_wrapper, sub_row, element,nodes, key, label;

  this.collection.filter('.predicate').forEach(function(predicate){
    label = predicate.data('label').replace(/\r?\n|\r/g,"");
    key = label.concat(predicate.data('type'));
    // If we already added this predicate to the list, we add it in the sub-rows
    if (document.getElementById(key) != null) {
      sub_rows_wrapper = document.getElementById(key).getElementsByClassName('sub_row_wrapper')[0];

      sub_row = document.createElement('div');
      sub_row.setAttribute('class','sub_row');

      sub_row.setAttribute("diagram",this.getDiagramName(predicate.data('diagram_id')));
      sub_row.setAttribute("node_id",predicate.id());
      sub_row.innerHTML = '- '+sub_row.getAttribute('diagram')+' - '+predicate.data('id_xml');

      sub_row.addEventListener('click',function() {goTo(this_graph,this);});

      sub_rows_wrapper.appendChild(sub_row);
    }
    // Else: this is a new predicate, we create its row and its first sub rows
    else {
      // row is the container of a row and a set of sub-rows
      row = document.createElement('div');
      row.setAttribute("id",key);
      row.setAttribute('class','predicate');

      // the "real" row
      wrap = document.createElement('div');
      wrap.setAttribute("class","row");

      // columns
      col = document.createElement('span');
      img  = document.createElement('img');
      img.setAttribute('src','icons/arrow_right_18dp.png');
      col.appendChild(img);
      wrap.appendChild(col);

      col = document.createElement('span');
      col.setAttribute('class','col type_img');
      img = document.createElement('img');
      img_type_address = 'icons/ic_treeview_'+predicate.data('type')+'_18dp_1x.png';

      img.setAttribute("src",img_type_address);
      col.appendChild(img);
      wrap.appendChild(col);


      col = document.createElement('div');
      col.setAttribute('class','info');
      col.innerHTML = label;

      wrap.appendChild(col);
      row.appendChild(wrap);

      wrap.firstChild.addEventListener('click',function() {toggleSubRows(this);});
      wrap.getElementsByClassName('info')[0].addEventListener('click',function() {
        this_graph.showDetails(predicate);
        this_graph.cy.nodes().unselect();
      });

      sub_rows_wrapper = document.createElement('div');
      sub_rows_wrapper.setAttribute('class','sub_row_wrapper');

      sub_row = document.createElement('div');
      sub_row.setAttribute('class','sub_row');

      sub_row.setAttribute("diagram",this.getDiagramName(predicate.data('diagram_id')));
      sub_row.setAttribute("node_id",predicate.id());
      sub_row.innerHTML = '- '+sub_row.getAttribute('diagram')+' - '+predicate.data('id_xml');

      sub_row.addEventListener('click',function() {goTo(this_graph,this);});

      sub_rows_wrapper.appendChild(sub_row);
      row.appendChild(sub_rows_wrapper);
    }
    // Child = predicates list
    child.appendChild(row);
  },this);

  // tools
  module = document.createElement('div');
  module.setAttribute('id','tools');
  module.setAttribute('class','module');

  child = document.createElement('div');
  child.setAttribute('id','zoom_tools');
  child.setAttribute('class','tooltip module');

  // zoom_in
  var aux = document.createElement('div');
  aux.setAttribute('class','zoom_button');
  aux.setAttribute('id','zoom_in');
  aux.innerHTML = '+';

  aux.addEventListener('click',function(){
    this_graph.cy.zoom({
      level: this_graph.cy.zoom()+0.08,
      renderedPosition: {x:this_graph.cy.width()/2, y:this_graph.cy.height()/2},
    });
    var slider_value = Math.round(this_graph.cy.zoom()/this_graph.cy.maxZoom()*100);
    document.getElementById('zoom_slider').setAttribute('value',slider_value);
  });
  aux.onselectstart = function() { return false};
  child.appendChild(aux);

  // tooltip
  aux = document.createElement('span');
  aux.setAttribute('class','tooltiptext');
  aux.setAttribute('onclick','toggle(this)');
  aux.innerHTML = 'Toggle slider';

  child.appendChild(aux);

  // slider
  aux = document.createElement('div');
  aux.style.textAlign = 'center';
  input = document.createElement('input');
  input.setAttribute('id','zoom_slider');
  input.setAttribute('class','hide collapsible');
  input.setAttribute('autocomplete','off');
  input.setAttribute('type','range');
  input.setAttribute('min','1');
  input.setAttribute('max','100');
  input.setAttribute('value','50');

  input.oninput = function() {
    var zoom_level = (this_graph.cy.maxZoom()/100) * this.value;
    this_graph.cy.zoom({
      level: zoom_level,
      renderedPosition: {x:this_graph.cy.width()/2, y:this_graph.cy.height()/2},
    });
  };

  aux.appendChild(input);

  child.appendChild(aux);

  // zoom_out
  aux = document.createElement('div');
  aux.setAttribute('class','zoom_button');
  aux.setAttribute('id','zoom_out');
  aux.innerHTML = '-';

  aux.addEventListener('click',function(){
    this_graph.cy.zoom({
      level: this_graph.cy.zoom()-0.08,
      renderedPosition: {x:this_graph.cy.width()/2, y:this_graph.cy.height()/2},
    });
    var slider_value = Math.round(this_graph.cy.zoom()/this_graph.cy.maxZoom()*100);
    document.getElementById('zoom_slider').setAttribute('value',slider_value);

  });
  aux.onselectstart = function() { return false};
  child.appendChild(aux);

  // add zoom_tools to the tools module
  module.appendChild(child);
  // add tools module to the container
  this.container.appendChild(module);



  // Details
  module = document.createElement('div');
  module.setAttribute('id','details');
  module.setAttribute('class','module hide collapsible');

  // module head
  child = document.createElement('div');
  child.setAttribute('id','details_head');
  child.setAttribute('class','module_head');
  child.innerHTML = 'Details';
  module.appendChild(child);

  // module button
  child = document.createElement('div');
  child.setAttribute('id','details_button');
  child.setAttribute('class','module_button');
  child.setAttribute('onclick','toggle(this)');
  img = document.createElement('img');
  img.setAttribute('src','icons/drop_down_24dp.png');
  child.appendChild(img);
  module.appendChild(child);

  // module body
  child = document.createElement('div');
  child.setAttribute('id','details_body');
  child.setAttribute('class','hide collapsible');
  module.appendChild(child);
  makeDraggable(module);
  this.container.appendChild(module);


  // filters
  module = document.createElement('div');
  module.setAttribute('id','filters');
  module.setAttribute('class','module');
  child = document.createElement('div');
  child.setAttribute('id','filter_body');
  child.setAttribute('class','hide collapsible');

  aux = document.createElement('div');
  aux.setAttribute('class','filtr_option');
  input = document.createElement('input');
  input.setAttribute('id','attr_check');
  input.setAttribute('type','checkbox');
  input.setAttribute('checked','checked');
  aux.appendChild(input);
  var label = document.createElement('label');
  label.innerHTML = 'Attributes';
  label.setAttribute('class','filtr_text');
  aux.appendChild(label);

  child.appendChild(aux);
  aux = aux.cloneNode(true);
  aux.firstElementChild.setAttribute('id','val_check');
  aux.lastElementChild.innerHTML = 'Value Domain';

  child.appendChild(aux);

  aux = aux.cloneNode(true);
  aux.firstElementChild.setAttribute('id','indiv_check');
  aux.lastElementChild.innerHTML = 'Individuals';
  child.appendChild(aux);
  aux = aux.cloneNode(true);
  aux.firstElementChild.setAttribute('id','forall_check');
  aux.lastElementChild.innerHTML = 'Universal Quantifier';
  child.appendChild(aux);

/*
  child.innerHTML = '<div class="filtr_option"><input id="attr_check" type="checkbox" checked /><label class="filtr_text">Attributes</label></div>';
  child.innerHTML += '<div class="filtr_option"><input id="val_check" type="checkbox" checked /><label class="filtr_text">Value Domain</label></div>';
  child.innerHTML += '<div class="filtr_option"><input id="indiv_check" type="checkbox" checked /><label class="filtr_text">Individuals</label></div>';
  child.innerHTML += '<div class="filtr_option"><input id="forall_check" type="checkbox" checked /><label class="filtr_text">Universal Quantifier</label></div>';
*/
  module.appendChild(child);
  module.innerHTML += '<div onclick="toggle(this)" style="padding:3px"><img src="icons/filter-24.png"/></div>';

  this.container.appendChild(module);

  var input;
  var elm = module.getElementsByClassName('filtr_option');

  for(i=0; i<elm.length; i++){
    input = elm[i].firstElementChild;

    input.addEventListener('click', function() {
      this_graph.filter(this.id);
    });
  }
}