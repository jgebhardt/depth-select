var height = 250;
var width = 50;
var ind_height = 10;
var min_force = 0;
var max_force = 200;
var cur_max_force = 0;

var view;

var ind = new Array();
var max_ind = new Array();
var circle_ind = new Array();

var obj_json;

function scale_pressure(input_force)
{
    if(input_force > max_force)
    {
        cur_max_force = input_force;
    }
    return (height/max_force)*input_force;
}

function canvas_setup()
{
    var canvas1 = document.getElementById('c1');
    var ps = new paper.PaperScope();
    ps.setup(canvas1);
    view = ps.view;
}

function p1_draw()
{

    var f1 = new paper.Path.Rectangle(0,0,width,height);
    var f2 = new paper.Path.Rectangle(50,0,width,height);
    var f3 = new paper.Path.Rectangle(100,0,width,height);
    var f4 = new paper.Path.Rectangle(150,0,width,height);
    var f5 = new paper.Path.Rectangle(200,0,width,height);
    f1.strokeColor = 'black';
    f2.strokeColor = 'black';
    f3.strokeColor = 'black';
    f4.strokeColor = 'black';
    f5.strokeColor = 'black';

    ind[0] = new paper.Path.Rectangle(0,height-ind_height,width,ind_height);
    ind[0].fillColor = 'orange';
    max_ind[0] = new paper.Path.Rectangle(0,height-ind_height,width,5);
    
    ind[1] = new paper.Path.Rectangle(50,height-ind_height,width,ind_height);
    ind[1].fillColor = 'red';
    max_ind[0] = new paper.Path.Rectangle(50,height-ind_height,width,5);

    ind[2] = new paper.Path.Rectangle(100,height-ind_height,width,ind_height);
    ind[2].fillColor = 'blue';
    max_ind[0] = new paper.Path.Rectangle(100,height-ind_height,width,5);

    ind[3] = new paper.Path.Rectangle(150,height-ind_height,width,ind_height);
    ind[3].fillColor = 'green';
    max_ind[0] = new paper.Path.Rectangle(150,height-ind_height,width,5);

    ind[4] = new paper.Path.Rectangle(200,height-ind_height,width,ind_height);
    ind[4].fillColor = 'yellow';
    max_ind[0] = new paper.Path.Rectangle(200,height-ind_height,width,5);

    /*
    for (mi in max_ind)
    {
        mi.fillColor = 'red';
    }
    */

    view.draw();
}

function p2_draw()
{
    circle_ind[0] = new paper.Path.Circle(new paper.Point(10,10), 20);
    circle_ind[0].fillColor = 'orange';
    view.draw();
}

function draw_currentForce(indicator, force)
{
    indicator.position.y = height - force;
    view.draw();
}

function draw_fingerPos()
{

}

function parse_json(input_json)
{
    console.log(input_json);
    obj_json = JSON.parse(input_json);
}

function draw_on_input()
{
    for(i=0; i<obj_json['f'].length;i++)
    {
        var input_pressure = obj_json['f'][i][4];
        var bar_height = scale_pressure(input_pressure);
        console.log(bar_height);
        draw_currentForce(ind[i], bar_height);
    }

}