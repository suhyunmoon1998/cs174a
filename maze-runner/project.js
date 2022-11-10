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
            [1,1,10]
        );

        // *** Materials
        // TODO: Change materials to add texture etc.
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
            path_light: new Material(new Radius_Shader(this.light_coords.length),
                {color: this.gray, specularity: 0}),
            texture: new Material(new defs.Textured_Phong(), {
                //color: hex_color("#ffffff"),
                ambient: 0.4, diffusivity: 0.1, specularity: 0.4,

                texture: new Texture("assets/rock3.png")
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

        this.maze_coords = Vector3.cast(
            [0,0,0],[0,0,1],[1,0,1],[2,0,1],[2,0,2],[2,0,3],[1,0,3],[0,0,3],[-1,0,3],
            [-2,0,3],[-2,0,2],
            [-2,0,1],[-3,0,1],[-4,0,1],[-4,0,2],[-4,0,3],
            [-4,0,4],[-4,0,5],[-3,0,5],
            [-2,0,5],[-2,0,6],[-1,0,6],[0,0,6],[1,0,6],[1,0,7],
            [1,0,8],[2,0,8],[2,0,9],[2,0,10],[1,0,10],[0,0,10],[0,0,11],[-1,0,11],
            [-2,0,11],[-2,0,10],[-2,0,9],[-3,0,9],[-4,0,9],
            [-4,0,10],[-4,0,11],[-4,0,12]
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
        for (let d = 0; d >= -(WALL_DEPTH_boxes*BOX_SIZE_units); d -= BOX_SIZE_units) {
            for (let h = 0; h < (WALL_HEIGHT_boxes*BOX_SIZE_units); h += BOX_SIZE_units) {
                this.shapes.cube.draw(context, program_state, Mat4.translation(LEFT_WALL_X_LOCATION, h, d), this.materials.texture);
                this.shapes.cube.draw(context, program_state, Mat4.translation(RIGHT_WALL_X_LOCATION, h, d), this.materials.texture);
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
            program_state.lights.push(new Light(vec4(x,y,z,1), color(1,1,1,1), 1000));
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
        const SWELL_PERIOD_SECONDS = 10;
        const w = 2 * Math.PI / SWELL_PERIOD_SECONDS;
        let swell = Math.sin(w*t);
        let light_radius = 2 * swell + 4;

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
        this.shapes.cube.draw(context, program_state, Mat4.translation(-8, 0.5, -26), this.materials.plastic.override({color: red}));

        // DRAW SPHERE
        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
    }
}

class Radius_Shader extends Shader {
    // **Phong_Shader** is a subclass of Shader, which stores and maanges a GPU program.
    // Graphic cards prior to year 2000 had shaders like this one hard-coded into them
    // instead of customizable shaders.  "Phong-Blinn" Shading here is a process of
    // determining brightness of pixels via vector math.  It compares the normal vector
    // at that pixel with the vectors toward the camera and light sources.


    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
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
                vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
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
                        
                        vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                                  + light_colors[i].xyz * specularity * specular;
                        result += attenuation * light_contribution;
                      }
                    return result;
                  } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
                attribute vec3 position, normal;                            
                // Position is expressed in object coordinates.
                
                uniform mat4 model_transform;
                uniform mat4 projection_camera_model_transform;
        
                void main(){                                                                   
                    point_position = model_transform * vec4(position, 1);
                    
                    // The vertex's final resting place (in NDCS):
                    gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                    // The final normal vector in screen space.
                    N = normalize( mat3( model_transform ) * normal / squared_scale);
                    vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                  } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
                uniform float radius;
                void main(){
                    gl_FragColor = vec4(0, 0, 0, 0);
                    for(int i = 0; i < N_LIGHTS; i++) {                                            
                        float distance_to_light = distance(light_positions_or_vectors[i].xyz, point_position.xyz);
                        if (distance_to_light < radius) { // TODO: fucking help me
                            // Compute an initial (ambient) color:
                            gl_FragColor = vec4( shape_color.xyz * ambient, shape_color.w );
                            // Compute the final color with contributions from lights:
                            gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
                        }
                    }
                } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform1f(gpu.radius, material.radius);
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}
