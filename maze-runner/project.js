import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene, Shader, Texture
} = tiny;

export class Project extends Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
        };

        this.gray = hex_color("#808080");

        this.light_coords = Vector3.cast(
             [2,1,3],
            [-2,1,5],
            [-3,1,9],
             [2,1,7]
        );

        // *** Materials
        // TODO: Change materials to add texture etc.
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            path_light: new Material(new Radius_Shader(this.light_coords.length),
                {color: this.gray, specularity: 0}),
            wall: new Material(new Textured_Phong, {
                ambient: 0.1, diffusivity: 0.2, specularity: 0.,
                texture: new Texture("assets/wall_stones.jpeg"),
                color: color(0,0,0,1),
            })
        };

        // *** Variables global to the scene

        const data_members = {
            thrust: vec3(0, 0, 0), meters_per_frame: 7, speed_multiplier: 1,
        };
        Object.assign(this, data_members);

        // TODO: Tweak the size of sphere and it's location as necessary
        this.avatar_point = vec4(0, 7, 0, 1);
        this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
            .times(Mat4.scale(0.5, 0.5, 0.5));

        this.BOX_SIZE_units = 2;
        
        
        this.random_1= [];
        for (let i = 0; i < 4; i++) {
            this.random_1.push(Math.random() < 0.5 ? -1 : 1);
        }
        

        this.random_2= [] ;
        for(let j = 1; j <10 ; j++){

            this.random_2.push(Math.floor(Math.random() * (3 - (-5) + 1) ) + (-5));
        }

        

        this.maze_coords = Vector3.cast(
            
            
            
            [0,0,1],[this.random_1[1],0,1],[this.random_1[1],0,2],
           [-5,0,3], [-4,0,3],[-3,0,3], [-2,0,3], [-1,0,3], [0,0,3], [1,0,3],[2,0,3],[3,0,3],    
            [this.random_2[1],0,4], 
           [-5,0,5],[-4,0,5],[-3,0,5], [-2,0,5], [-1,0,5], [0,0,5], [1,0,5],[2,0,5],[3,0,5],
             [this.random_2[2],0,6], 
           [-5,0,7],[-4,0,7],[-3,0,7], [-2,0,7], [-1,0,7], [0,0,7], [1,0,7],[2,0,7],[3,0,7],
             [this.random_2[3],0,8], 
           [-5,0,9],[-4,0,9],[-3,0,9], [-2,0,9], [-1,0,9], [0,0,9], [1,0,9],[2,0,9],[3,0,9],
             [this.random_2[4],0,10], 
            [-5,0,11],[-4,0,11],[-3,0,11], [-2,0,11], [-1,0,11], [0,0,11], [1,0,11],[2,0,11],[3,0,11],
          [this.random_2[5],0,12],
            [-5,0,13],[-4,0,13],[-3,0,13], [-2,0,13], [-1,0,13], [0,0,13], [1,0,13],[2,0,13],[3,0,13]
       
           
            /*
            [0,0,0],[0,0,1],[1,0,1],[2,0,1],[2,0,2],[2,0,3],[1,0,3],[0,0,3],[-1,0,3],
            [-2,0,3],[-2,0,2],
            [-2,0,1],[-3,0,1],[-4,0,1],[-4,0,2],[-4,0,3],
            [-4,0,4],[-4,0,5],[-3,0,5],
            [-2,0,5],[-2,0,6],[-1,0,6],[0,0,6],[1,0,6],[1,0,7],
            [1,0,8],[2,0,8],[2,0,9],[2,0,10],[1,0,10],[0,0,10],[0,0,11],[-1,0,11],
            [-2,0,11],[-2,0,10],[-2,0,9],[-3,0,9],[-4,0,9],
            [-4,0,10],[-4,0,11],[-4,0,12]
            */
        );

        this.ALL_VISIBLE_INTERVAL = 4.0;
        this.ALL_VISIBLE_TIME = 1.0;
        this.all_visible = false;
        this.set_last_time = false;
        this.last_time_all_visible = 0;
        this.start_time_all_visible = 0;
    }

    make_control_panel() {
        this.live_string(box => box.textContent = "Position: "
            + this.avatar_point[0].toFixed(2) + ", "
            + this.avatar_point[1].toFixed(2)+ ", "
            + this.avatar_point[2].toFixed(2));
        this.new_line();
        this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Left", ["a"], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0);
        this.key_triggered_button("Back", ["s"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Right", ["d"], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0);
        //this.key_triggered_button("TEMP", ["x"], () => this.thrust[1] = -1, undefined, () => this.thrust[1] = 0);
    }
    draw_walls(context, program_state) {
        const LEFT_WALL_X_LOCATION = -12;
        const RIGHT_WALL_X_LOCATION = 8
        const BOX_SIZE_units = this.BOX_SIZE_units;
        const WALL_DEPTH_boxes = 14;
        const WALL_HEIGHT_boxes = 7;
        const WALL_DEEP_START = -4 * BOX_SIZE_units;
        for (let d = 0; d >= -(WALL_DEPTH_boxes*BOX_SIZE_units); d -= BOX_SIZE_units) {
            for (let h = WALL_DEEP_START; h < (WALL_HEIGHT_boxes*BOX_SIZE_units); h += BOX_SIZE_units) {
                this.shapes.cube.draw(context, program_state, Mat4.translation(LEFT_WALL_X_LOCATION, h, d), this.materials.wall);
                this.shapes.cube.draw(context, program_state, Mat4.translation(RIGHT_WALL_X_LOCATION, h, d), this.materials.wall);
            }
        }
    }

    draw_maze(context, program_state, light_radius) {
        const maze_coords = this.maze_coords;
        for (let i = 0; i < maze_coords.length; i++) {
            let x = maze_coords[i][0] * this.BOX_SIZE_units, y = maze_coords[i][1] * this.BOX_SIZE_units,
                z = -maze_coords[i][2] * this.BOX_SIZE_units;
            // uncomment the line below to see without darkness
            // this.shapes.cube.draw(context, program_state, Mat4.translation(x, y, z),this.materials.plastic.override({color: this.gray}));
            this.shapes.cube.draw(context, program_state, Mat4.translation(x, y, z),this.materials.path_light.override({radius: light_radius}));
        }
    }

    set_lights(program_state) {
        program_state.lights = [];
        const light_coords = this.light_coords
        for (let i = 0; i < light_coords.length; i++) {
            let x = light_coords[i][0] * this.BOX_SIZE_units, y = light_coords[i][1] * this.BOX_SIZE_units,
                z = -light_coords[i][2] * this.BOX_SIZE_units;
            program_state.lights.push(new Light(vec4(x,y,z,1), hex_color("#b0f542"), 1000));
        }
    }

    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            // this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
        }
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;

        // MOVE AVATAR AND CAMERA based on key input
        const m = this.speed_multiplier * this.meters_per_frame;
        this.avatar_transform.pre_multiply(Mat4.translation(...this.thrust.times(dt * m)));
        this.avatar_point = Mat4.translation(...this.thrust.times(dt * m)).times(this.avatar_point);

        // TODO: Apply gravity on the ball
        let gravity;
        if (this.avatar_point[1] <= 1.5) {
            this.thrust[1] = 0;
            this.avatar_point[1] = 1.5;
            gravity = 0;
        } else {
            gravity = 0.02;
        }
        this.thrust[1] -= gravity;


        // TODO: Tweak eye point as necessary to make the game look good
        let eye_point = (this.avatar_point.to3()).plus(vec3(0, 3.6, 6));
        let camera_matrix = Mat4.look_at(eye_point, this.avatar_point.to3(), vec3(0, 1, 0));
        program_state.set_camera(camera_matrix);

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // --------------- LIGHTS ---------------
        // *** Lights: *** Values of vector or point lights.
        this.set_lights(program_state);

        // RADIUS
        const SWELL_PERIOD_SECONDS = 5;
        const w = 2 * Math.PI / SWELL_PERIOD_SECONDS;
        let swell = Math.sin(w*t);
        let light_radius = swell + 2.5;

        if (!this.set_last_time) {
            this.last_time_all_visible = t;
            this.set_last_time = true;
        }
        if (this.all_visible) {
            light_radius = 100.0;
        }
        if (this.all_visible && (t > this.start_time_all_visible + this.ALL_VISIBLE_TIME)) {
            this.last_time_all_visible = t;
            this.all_visible = false;
        }
        if (!this.all_visible && (t > this.last_time_all_visible + this.ALL_VISIBLE_INTERVAL)) {
            this.start_time_all_visible = t;
            this.all_visible = true;
        }


        // --------------- DRAW OBJECTS ---------------
        const red = hex_color("#FF0000");

        // DRAW WALLS
        this.draw_walls(context, program_state);

        // DRAW MAZE
        this.draw_maze(context, program_state, light_radius);

        // Red end caps
        this.shapes.cube.draw(context, program_state, Mat4.translation(0, 0.5, 2), this.materials.plastic.override({color: red}));
        this.shapes.cube.draw(context, program_state, Mat4.translation(this.random_2[6], 0.5, -26), this.materials.plastic.override({color: red}));

        // DRAW SPHERE
        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
    }
}

class Textured_Phong extends defs.Phong_Shader {
    // **Textured_Phong** is a Phong Shader extended to addditionally decal a
    // texture image over the drawn shape, lined up according to the texture
    // coordinates that are stored at each shape vertex.
    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` precision mediump float;
                const int N_LIGHTS = ` + this.num_lights + `;
                uniform float ambient, diffusivity, specularity, smoothness;
                uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
                uniform float light_attenuation_factors[N_LIGHTS];
                uniform vec4 shape_color;
                uniform vec3 squared_scale, camera_center;
        
                // Specifier "varying" means a variable's final value will be passed from the vertex shader
                // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
                // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
                varying vec3 N, vertex_worldspace;
                // ***** PHONG SHADING HAPPENS HERE: *****                                       
                vec3 phong_model_lights( vec4 tex_color, vec3 N, vec3 vertex_worldspace ){                                        
                    // phong_model_lights():  Add up the lights' contributions.
                    vec3 E = normalize( camera_center - vertex_worldspace );
                    vec3 result = vec3( 0.0 );
                    for(int i = 0; i < N_LIGHTS; i++){
                        // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                        // light will appear directional (uniform direction from all points), and we 
                        // simply obtain a vector towards the light by directly using the stored value.
                        // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                        // the point light's location from the current surface point.  In either case, 
                        // fade (attenuate) the light as the vector needed to reach it gets longer.  
                        vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                                       light_positions_or_vectors[i].w * vertex_worldspace;                                             
                        float distance_to_light = length( surface_to_light_vector );
        
                        vec3 L = normalize( surface_to_light_vector );
                        vec3 H = normalize( L + E );
                        // Compute the diffuse and specular components from the Phong
                        // Reflection Model, using Blinn's "halfway vector" method:
                        float diffuse  =      max( dot( N, L ), 0.0 );
                        float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                        float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                        
                        vec3 light_contribution = tex_color.xyz   * light_colors[i].xyz * diffusivity * diffuse
                                                                  + light_colors[i].xyz * specularity * specular;
                        result += attenuation * light_contribution;
                      }
                    return result;
                  } `;
    }
    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                attribute vec3 position, normal;                            
                // Position is expressed in object coordinates.
                attribute vec2 texture_coord;
                
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
        
                void main(){                                                                   
                    // The vertex's final resting place (in NDCS):
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    // The final normal vector in screen space.
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                    // Turn the per-vertex texture coordinate into an interpolated variable.
                    f_tex_coord = texture_coord;
                  } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                uniform sampler2D texture;
        
                void main(){
                    // Sample the texture image in the correct place:
                    vec4 tex_color = texture2D( texture, f_tex_coord );
                    if( tex_color.w < .01 ) discard;
                                                                             // Compute an initial (ambient) color:
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                                                                             // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( tex_color, normalize( N ), vertex_worldspace );
                  } `;
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Add a little more to the base class's version of this method.
        super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);

        if (material.texture && material.texture.ready) {
            // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
            context.uniform1i(gpu_addresses.texture, 0);
            // For this draw, use the texture image from correct the GPU buffer:
            material.texture.activate(context);
        }
    }
}

class Radius_Shader extends Textured_Phong {
    send_material(gl, gpu, material) {
        super.send_material(gl, gpu, material);
        gl.uniform1f(gpu.radius, material.radius);
    }
    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` precision mediump float;
                const int N_LIGHTS = ` + this.num_lights + `;
                uniform float ambient, diffusivity, specularity, smoothness;
                uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
                uniform float light_attenuation_factors[N_LIGHTS];
                uniform vec4 shape_color;
                uniform vec3 squared_scale, camera_center;

                // Specifier "varying" means a variable's final value will be passed from the vertex shader
                // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
                // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
                varying vec3 N, vertex_worldspace;
                varying vec4 point_position;
                // ***** PHONG SHADING HAPPENS HERE: *****
                vec3 phong_model_lights( vec4 tex_color, vec3 N, vec3 vertex_worldspace ){
                    // phong_model_lights():  Add up the lights' contributions.
                    vec3 E = normalize( camera_center - vertex_worldspace );
                    vec3 result = vec3( 0.0 );
                    for(int i = 0; i < N_LIGHTS; i++){
                        // Lights store homogeneous coords - either a position or vector.  If w is 0, the
                        // light will appear directional (uniform direction from all points), and we
                        // simply obtain a vector towards the light by directly using the stored value.
                        // Otherwise if w is 1 it will appear as a point light -- compute the vector to
                        // the point light's location from the current surface point.  In either case,
                        // fade (attenuate) the light as the vector needed to reach it gets longer.
                        vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                                       light_positions_or_vectors[i].w * vertex_worldspace;
                        float distance_to_light = length( surface_to_light_vector );

                        vec3 L = normalize( surface_to_light_vector );
                        vec3 H = normalize( L + E );
                        // Compute the diffuse and specular components from the Phong
                        // Reflection Model, using Blinn's "halfway vector" method:
                        float diffuse  =      max( dot( N, L ), 0.0 );
                        float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                        float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );

                        vec3 light_contribution = tex_color.xyz   * light_colors[i].xyz * diffusivity * diffuse
                                                                  + light_colors[i].xyz * specularity * specular;
                        result += attenuation * light_contribution;
                      }
                    return result;
                  } `;
    }
    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
                varying vec2 f_tex_coord;
                attribute vec3 position, normal;
                // Position is expressed in object coordinates.
                attribute vec2 texture_coord;

                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;

                void main(){
                    point_position = model_transform * vec4(position, 1);

                    // The vertex's final resting place (in NDCS):
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    // The final normal vector in screen space.
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                    // Turn the per-vertex texture coordinate into an interpolated variable.
                    f_tex_coord = texture_coord;
                  } `;
    }
    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
                uniform float radius;
                varying vec2 f_tex_coord;
                uniform sampler2D texture;

                void main(){
                    gl_FragColor = vec4(0, 0, 0, 0);
                    for(int i = 0; i < N_LIGHTS; i++) {
                        float distance_to_light = distance(light_positions_or_vectors[i].xyz, point_position.xyz);
                        if (distance_to_light < radius) {
                            // Sample the texture image in the correct place:
                            vec4 tex_color = texture2D( texture, f_tex_coord );
                            if( tex_color.w < .01 ) discard;
                                                                                     // Compute an initial (ambient) color:
                            gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                                                                                     // Compute the final color with contributions from lights:
                            gl_FragColor.xyz += phong_model_lights( tex_color, normalize( N ), vertex_worldspace );
                        }
                    }
                } `;
    }
}
