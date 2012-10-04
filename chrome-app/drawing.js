var app = {}

$(document).ready(function(){
    
    app.canvas = $('#mainCanvas')
    paper.setup(app.canvas[0])
    paper.view.draw()
    
    app.pathCount = 5 
    app.myPath = []
    _(app.pathCount).times(function(i){
       app.myPath[i] = new paper.Path()
       var color = new paper.HsbColor(Math.round(Math.random()*359), 0.9, 0.7)
       console.log(color)
       app.myPath[i].fillColor = color
    })
    
    app.currentPath = 0
    app.getCurrentPath = function(){
        return app.myPath[app.currentPath]
    }
    app.setCurrentPath = function(){
        app.currentPath = Math.round(Math.random() * 4)
    }
    setInterval(function(){app.setCurrentPath()}, 500)

    app.canvas.on('mousemove', function(event) {
        
        var path = app.getCurrentPath();

        var new_point = new paper.Point(event.pageX, event.pageY)
        var middle_point = new_point.subtract([event.originalEvent.webkitMovementX/2, event.originalEvent.webkitMovementY/2])
        var delta = new paper.Point(event.originalEvent.webkitMovementX, event.originalEvent.webkitMovementY)
        var step = delta.divide(2)
        step.angle += 90
        
        var top = middle_point.add(step)
        var bottom = middle_point.subtract(step)

        path.add(top)
        path.insert(0, bottom)
        path.smooth()

        paper.view.draw()        
    })

})