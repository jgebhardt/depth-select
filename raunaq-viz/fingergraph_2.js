var height = 250;
var w = 400;
var x_translate = 50;
var y_translate = 200;
var width = 50;
var ind_height = 10;
var min_force = 0;
var max_force = 1000;
var point_radius = 5;

var alpha_value = 0.5;

var max_touch_size = 100;
var size_multiplier = 10;

var view;

var ind = new Array();
var active_ind;
var circle_ind = new Array();

var obj_json;

function scale_pressure(input_force)
{
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
    var canvas_border = new paper.Path.Rectangle(0,0,500,500);
    canvas_border.strokeColor = 'gray';
    canvas_border.fillColor = 'whitesmoke';

    var border = new paper.Path.Rectangle(x_translate,y_translate,w,height);
    border.fillColor = 'white';
    border.strokeColor = 'black';

    for(i=0;i<5;i++)
    {
        circle_ind[i] = new paper.Path.Circle(new paper.Point(),point_radius);
        circle_ind[i].fillColor = 'red';
        circle_ind[i].alpha = 0;
    }

    ind[0] = new paper.Path.Rectangle(0,0,width,height);
    ind[0].fillColor = 'orange';
    ind[0].fillColor.alpha = 0;
    
    ind[1] = new paper.Path.Rectangle(0,0,width,height);
    ind[1].fillColor = 'red';
    ind[1].fillColor.alpha = 0;

    ind[2] = new paper.Path.Rectangle(0,0,width,height);
    ind[2].fillColor = 'blue';
    ind[2].fillColor.alpha = 0;

    ind[3] = new paper.Path.Rectangle(0,0,width,height);
    ind[3].fillColor = 'green';
    ind[3].fillColor.alpha = 0;

    ind[4] = new paper.Path.Rectangle(0,0,width,height);
    ind[4].fillColor = 'yellow';
    ind[4].fillColor.alpha = 0;

    view.draw();
}

function p2_draw()
{
    circle_ind[0] = new paper.Path.Circle(new paper.Point(10,10), 20);
    circle_ind[0].fillColor = 'orange';
    view.draw();
}

function draw_currentForce(indicator, force, point, radius)
{
    //indicator.scale(1, (force/max_force)*20, new paper.Point(0,height));
    active_ind.scale(1, (force/max_force));
    active_ind.position = new paper.Point(point.x, point.y-((active_ind.bounds.height)/2));
    active_ind.fillColor.alpha = alpha_value;
    //indicator.scale(1, (force/max_force), new paper.Point(0,height));
    
    circle_ind[indicator].position = new paper.Point(point.x, point.y);
    circle_ind[indicator].fillColor.alpha = alpha_value;

    view.draw();
}

function erase_currentForce()
{
    for(i=0;i<5;i++)
    {
        ind[i].fillColor.alpha = 0;
        circle_ind[i].fillColor.alpha = 0;
    }

    view.draw();
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
        active_ind = ind[i];
        var input_pressure = obj_json['f'][i][3];
        var input_x = obj_json['f'][i][1];
        var input_y = obj_json['f'][i][2];
        var input_size = obj_json['f'][i][4];

        console.log(input_pressure + "x: " + input_x + " y: " + input_y);
        //var bar_height = scale_pressure(input_pressure);
        draw_currentForce(i, input_pressure, new paper.Point(x_translate + input_x, y_translate + input_y), ((input_size/max_touch_size)*size_multiplier));
    }

}