### all code assuming fresh, default blender file ###

# the currently selected object
py.context.active_object

# move Cube object to specific position
bpy.data.objects['Cube'].location = [0, 1, 0]

# change position of one of the cube's points 
bpy.data.objects["Cube"].data.vertices[0].co.x += 1.0


# get rotation of 3D view
bpy.context.screen.areas[4].spaces[0].region_3d.view_rotation

# hack to rotate view (around z axis of a 'pivot' object):
# first, create "pivot" object: (header menu above 3D view) > Add > Empty Object; rename to "cam_handle"
# in the scene graph, drag the Camera to be a child of the new empty object
# select camera, then select 'set active object as camera'
# finally, rotate the camera:
bpy.data.objects['cam_handle'].rotation_euler.rotate_axis('Z', pi/10)






