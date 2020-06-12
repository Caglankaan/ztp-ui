import React, { Component } from 'react';
import data from "./data"; 

const socialMediaList = data.SocialMedias;

class Example1 extends Component {
	render() {
		return (
            <div>
                {
					data.Experiences.map((experience, i) => {
						return (
							<div key={i}>
								<div>
									<a href={experience.url}>
										<img src={experience.logo} alt={experience.companyName} />
									</a>
									<div>
										<div>
											<a href={experience.url}>{experience.companyName}</a>
										</div>
											{experience.roles.map(function (role, i) { 
												return <div key={i}>
													<h5>{role.title}</h5>
													<span>{role.startDate}</span>
													<span>{role.location}</span>
													<p>{role.description}</p>
												</div>
											})}
									</div>
								</div>
							</div>
						);
					})
				}
            </div>
        );
    }
} 
export default Example1;